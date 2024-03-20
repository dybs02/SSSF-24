import promisePool from '../../database/db';
import {Animal} from '../../types/DBTypes';
import {RowDataPacket} from 'mysql2';

const getAllAnimals = async (): Promise<Animal[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & Animal[]>(
    'SELECT * FROM animals'
  );
  if (!rows) {
    throw new Error('No animals found');
  }
  return rows as Animal[];
};

const getAnimalById = async (id: number): Promise<Animal> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & Animal[]>(
    'SELECT * FROM animals WHERE animal_id = ?',
    [id]
  );
  if (!rows) {
    throw new Error('No animals found');
  }
  return rows[0] as Animal;
};

export {getAllAnimals, getAnimalById};