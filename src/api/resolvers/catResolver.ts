import {GraphQLError} from 'graphql';
import catModel from '../models/catModel';
import {Cat, LocationInput, TokenContent, User} from '../../types/DBTypes';
import mongoose from 'mongoose';
import userResolver from './userResolver';


const populateOwner = async (cat: Cat): Promise<Cat> => {
  const owner = await userResolver.Query.userById(null, {id: cat.owner.toString()}, null)
  owner.id = owner._id
  const updatedCat = {
    ...cat.toObject!(),
    owner: owner as User,
    id: cat._id
  };
  return updatedCat;
}



export default {
  Query: {
    catById: async (
      parent: any,
      args: {id: string},
      context: any
    ): Promise<Cat> => {
      const cat = await catModel.findById(args.id);
      if (!cat) {
        throw new GraphQLError('Cat not found');
      }
      cat.id = cat._id;
      return populateOwner(cat);
      // return cat;
    },
    cats: async (
      parent: any,
      args: any,
      context: any
    ): Promise<Cat[]> => {
      const cats = await catModel.find();
      const updatedCats = await Promise.all(cats.map(async (cat) => {
        return await populateOwner(cat);
      }));
      return updatedCats;
    },
    catsByArea: async (
      parent: any,
      args: LocationInput,
      context: any
    ): Promise<Cat[]> => {
      const cats = await catModel.find({
        location: {
          $geoWithin: {
            $box: [
              [args.bottomLeft.lng, args.bottomLeft.lat],
              [args.topRight.lng, args.topRight.lat],
            ],
          },
        },
      });
      const updatedCats = await Promise.all(cats.map(async (cat) => {
        return await populateOwner(cat);
      }));
      return updatedCats;
    },
    catsByOwner: async (
      parent: any,
      args: {ownerId: string},
      context: any
    ): Promise<Cat[]> => {
      const cats = await catModel.find({owner: args.ownerId});
      const updatedCats = await Promise.all(cats.map(async (cat) => {
        return await populateOwner(cat);
      }));
      return updatedCats;
    }
  },
  Mutation: {
    createCat: async (
      parent: any,
      args: {input: Cat},
      context: any
    ): Promise<Cat> => {
      console.log('args huj', args);
      args.input.owner = context.userdata.user._id;
      let cat = await catModel.create(args.input);
      return populateOwner(cat);
    },
    updateCat: async (
      parent: any,
      args: {id: string; input: Cat},
      context: any
    ): Promise<Cat> => {
      const cat = await catModel.findById(args.id);
      if (!cat) {
        throw new GraphQLError('Cat not found');
      }
      if (
        cat.owner.toString() !== context.userdata.user._id &&
        context.userdata.user.role !== 'admin'
      ) {
        throw new GraphQLError('Not authorized');
      }
      const updated_cat = await catModel.findByIdAndUpdate(
        args.id,
        args.input,
        {new: true}
      );
      if (!updated_cat) {
        throw new GraphQLError('Cat not found');
      }
      updated_cat.id = updated_cat._id;
      console.log('updated_cat', updated_cat);
      return populateOwner(updated_cat);
    },
    deleteCat: async (
      parent: any,
      args: {id: string},
      context: any
    ): Promise<Cat> => {
      const cat = await catModel.findById(args.id);
      if (!cat) {
        throw new GraphQLError('Cat not found');
      }
      if (
        cat.owner.toString() !== context.userdata.user._id &&
        context.userdata.user.role !== 'admin'
      ) {
        throw new GraphQLError('Not authorized');
      }
      const deleted_cat = await catModel.findByIdAndDelete(args.id);
      if (!deleted_cat) {
        throw new GraphQLError('Cat not found');
      }
      deleted_cat.id = deleted_cat._id;
      console.log('deleted_cat', deleted_cat);
      return populateOwner(deleted_cat);
    }
  }
}