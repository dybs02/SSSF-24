import { Cat } from "../../interfaces/Cat";
import catModel from "../models/catModel";

type Coordinates = {
  lat: Number
  lng: Number
}

export default {
  Query: {
    cats: async (): Promise<Cat[]> => {
      return await catModel.find();
    },
    catById: async (
      _parent: undefined,
      args: { id: string },
    ): Promise<Cat> => {
      const cat = await catModel.findById(args.id).populate('owner');
      if (!cat) {
        throw new Error('Cat not found');
      }
      return cat;
    },
    catsByOwner: async (
      _parent: undefined,
      args: { ownerId: String },
    ): Promise<Cat[]> => {
      const cats = await catModel.find({ owner: args.ownerId }).populate('owner');
      if (!cats) {
        throw new Error('Cat not found');
      }
      return cats;
    },
    catsByArea: async (
      _parent: undefined,
      args: {
        topRight: Coordinates,
        bottomLeft: Coordinates
      },
    ): Promise<Cat[]> => {
      const cats = await catModel.find({
        location: {
          $geoWithin: {
            $geometry: {
              type: 'Polygon',
              coordinates: [[
                [args.topRight.lat, args.topRight.lng],
                [args.topRight.lat, args.bottomLeft.lng],
                [args.bottomLeft.lat, args.bottomLeft.lng],
                [args.bottomLeft.lat, args.topRight.lng],
                [args.topRight.lat, args.topRight.lng],
              ]]
            }
          }
        }
      }).populate('owner');

      if (!cats) {
        throw new Error('Cat not found');
      }
      return cats;
    },
  },
  Mutation: {
    createCat: async (
      _parent: undefined,
      args: {
        cat_name: String,
        weight: Number,
        birthdate: Date,
        owner: String,
        location: { type: String, coordinates: [Number] },
        filename: String,
      },
    ): Promise<Cat> => {
      const cat = await catModel.create(args);
      if (!cat) {
        throw new Error('Cat not found');
      }
      return cat;
    },
    updateCat: async (
      _parent: undefined,
      args: {
        id: String,
        cat_name: String,
        weight: Number,
        birthdate: Date
      },
    ): Promise<Cat> => {
      const cat = await catModel.findByIdAndUpdate(
        args.id,
        args,
        { new: true },
      );
      if (!cat) {
        throw new Error('Cat not found');
      }
      return cat;
    },
    deleteCat: async (
      _parent: undefined,
      args: { id: string },
    ): Promise<Cat> => {
      const cat = await catModel.findByIdAndDelete(args.id);
      if (!cat) {
        throw new Error('Cat not found');
      }
      return cat;
    }
  },
};