import {GraphQLError} from 'graphql';
import {Cat, TokenContent, UserInput, UserOutput} from '../../types/DBTypes';
import fetchData from '../../functions/fetchData';
import {LoginResponse, UserResponse} from '../../types/MessageTypes';


export default {
  Query: {
    users: async (
      parent: any,
      args: any,
      context: any
    ): Promise<UserOutput[]> => {
      const users = await fetchData<UserOutput[]>(
        `${process.env.AUTH_URL}/users`,
        {
          method: 'GET',
        },
      );
      const users_res = users.map((user) => {
        user.id = user._id;
        return user;
      });
      return users_res;
    },
    userById: async (
      parent: any,
      args: {id: string},
      context: any
    ): Promise<UserOutput> => {
      const user = await fetchData<UserOutput>(
        `${process.env.AUTH_URL}/users/${args.id}`,
        {
          method: 'GET',
        },
      );
      user.id = user._id;
      return user;
    },
    checkToken: async (
      parent: any,
      args: any,
      context: any
    ): Promise<TokenContent> => {
      return context.userdata; // TODO fix
    }

  },
  Mutation: {
    login: async (
      parent: any,
      args: {credentials: UserInput},
      context: any
    ): Promise<LoginResponse> => {
      const user = await fetchData<LoginResponse>(
        `${process.env.AUTH_URL}/auth/login`,
        {
          method: 'POST',
          body: JSON.stringify(args.credentials),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      user.user.id = user.user._id;
      return user;
    },
    register: async (
      parent: any,
      args: {user: UserInput},
      context: any
    ): Promise<UserResponse> => {
      const user = await fetchData<UserResponse>(
        `${process.env.AUTH_URL}/users`,
        {
          method: 'POST',
          body: JSON.stringify(args.user),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      user.user.id = user.user._id;
      return user;
    },
    updateUser: async (
      parent: any,
      args: {user: UserInput},
      context: any
    ): Promise<UserResponse> => {
      const user = await fetchData<UserResponse>(
        `${process.env.AUTH_URL}/users`,
        {
          method: 'PUT',
          body: JSON.stringify(args.user),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${context.userdata.token}`,
          },
        },
      );
      user.user.id = user.user._id;
      return user;
    },
    updateUserAsAdmin: async (
      parent: any,
      args: {user: UserInput},
      context: any
    ): Promise<UserResponse> => {
      if (context.userdata.user.role !== 'admin') {
        throw new GraphQLError('Not authorized');
      }
      const user = await fetchData<UserResponse>(
        `${process.env.AUTH_URL}/users`,
        {
          method: 'PUT',
          body: JSON.stringify(args.user),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${context.userdata.token}`,
          },
        },
      );
      user.user.id = user.user._id;
      return user;
    },
    deleteUser: async (
      parent: any,
      args: any,
      context: any
    ): Promise<UserResponse> => {
      const user = await fetchData<UserResponse>(
        `${process.env.AUTH_URL}/users/${context.userdata.user._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${context.userdata.token}`,
          },
        },
      );
      user.user.id = user.user._id;
      return user;
    },
    deleteUserAsAdmin: async (
      parent: any,
      args: {id: string},
      context: any
    ): Promise<UserResponse> => {
      if (context.userdata.user.role !== 'admin') {
        throw new GraphQLError('Not authorized');
      }
      const user = await fetchData<UserResponse>(
        `${process.env.AUTH_URL}/users/${args.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${context.userdata.token}`,
          },
        },
      );
      user.user.id = user.user._id;
      return user;
    }
  }
}