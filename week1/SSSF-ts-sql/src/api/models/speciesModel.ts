import promisePool from '../../database/db';
import {Category, Species} from '../../types/DBTypes';
import {RowDataPacket} from 'mysql2';

// type SpeciesRes = Omit<Species, 'category'> & {category: Category};

const getAllSpecies = async (): Promise<Species[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & Species[]>(
    `
    SELECT species_id, species_name, image,
    JSON_OBJECT('category_id', categories.category_id, 'category_name', categories.category_name) AS category
    FROM species
    JOIN categories ON species.category = categories.category_id
    `
  );
  if (!rows) {
    throw new Error('No species found');
  }

  const species = rows.map((row) => {
    return {
      ...row,
      category: JSON.parse(row.category),
    };
  });

  return species as Species[];
};

const getSpeciesById = async (id: number): Promise<Species> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & Species[]>(
    `
    SELECT species_id, species_name, image,
    JSON_OBJECT('category_id', categories.category_id, 'category_name', categories.category_name) AS category
    FROM species
    JOIN categories ON species.category = categories.category_id
    WHERE species_id = ?
    `,
    [id]
  );
  if (!rows) {
    throw new Error('No species found');
  }

  const species = rows.map((row) => {
    return {
      ...row,
      category: JSON.parse(row.category),
    };
  });
  
  return species[0] as Species;
};

export {getAllSpecies, getSpeciesById};