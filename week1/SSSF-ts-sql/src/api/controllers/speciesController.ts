import {Request, Response, NextFunction} from 'express';
import {getAllSpecies, getSpeciesById} from '../models/speciesModel';
import {Species} from '../../types/DBTypes';

const speciesListGet = async (
  req: Request,
  res: Response<Species[]>,
  next: NextFunction
) => {
  try {
    const species = await getAllSpecies();
    res.json(species);
  } catch (error) {
    next(error);
  }
};

const speciesGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response<Species>,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const species = await getSpeciesById(id);
    res.json(species);
  } catch (error) {
    next(error);
  }
};

export {speciesListGet, speciesGet};