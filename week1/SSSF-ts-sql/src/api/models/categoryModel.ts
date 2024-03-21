import promisePool from '../../database/db';
import {Category} from '../../types/DBTypes';
import {RowDataPacket} from 'mysql2';
import {ResultSetHeader} from 'mysql2/promise';

const getAllCategories = async (): Promise<Category[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & Category[]>(
    'SELECT * FROM categories'
  );
  if (!rows) {
    throw new Error('No categories found');
  }
  return rows as Category[];
};

const getCategoryById = async (id: number): Promise<Category> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & Category[]>(
    'SELECT * FROM categories WHERE category_id = ?',
    [id]
  );
  if (!rows) {
    throw new Error('No categories found');
  }
  return rows[0] as Category;
};

const postCategory = async (category: Category) => {
  const [ret] = await promisePool.execute<ResultSetHeader>(
    'INSERT INTO categories (category_name) VALUES (?)',
    [category.category_name]
  );

  console.log(ret);
  return ret.affectedRows > 0;
}

const putCategory = async (id: number, category: Category) => {
  const [ret] = await promisePool.execute<ResultSetHeader>(
    'UPDATE categories SET category_name = ? WHERE category_id = ?',
    [
      category.category_name,
      id
    ]
  );

  console.log(ret);
  return ret.affectedRows > 0;
}

const deleteCategory = async (id: number) => {
  const [ret] = await promisePool.execute<ResultSetHeader>(
    'DELETE FROM categories WHERE category_id = ?',
    [id]
  );

  console.log(ret);
  return ret.affectedRows > 0;
}

export {getAllCategories, getCategoryById, postCategory, putCategory, deleteCategory};
