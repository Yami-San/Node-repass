import e from 'express'
import mysql from 'mysql2/promise'
import { object } from 'zod'
const DEFAULT_CONFIG = {
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: '',
  database: 'moviesdb'
}
const connectionString = process.env.DATABASE_URL ?? DEFAULT_CONFIG

const connection = await mysql.createConnection(connectionString)

export class MovieModel {
  //get movie title by genre
  static async getAll ({ genre }) {

    if (genre) {
      const lowerCaseGenre = genre.toLowerCase()

      // get genre ids from database table using genre names
      const [genres] = await connection.query(
        'SELECT id FROM genre WHERE LOWER(name) = ?;',
        [lowerCaseGenre]
      )

      // no genre found
      if (genres.length === 0) return []

      // get the id from the first genre result
      const [{ id }] = genres

      const [movies] = await connection.query(
        `SELECT title FROM movie LEFT JOIN movie_genres ON movie.id = movie_genres.movie_id AND movie_genres.genre_id = ${id};`
      )
      if (movies.length === 0) return []
      return movies
    }

    const [movies] = await connection.query(
      'SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movie;'
    )

    return movies
  }

  static async getById ({ id }) {
    const [movies] = await connection.query(
      `SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id
        FROM movie WHERE id = UUID_TO_BIN(?);`,
      [id]
    )

    if (movies.length === 0) return null

    return movies[0]
  }

  static async create ({ input }) {
    const {
      genre: genreInput, // genre is an array
      title,
      year,
      duration,
      director,
      rate,
      poster
    } = input

    // todo: crear la conexión de genre

    // crypto.randomUUID()
    const [uuidResult] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuidResult

    try {
      await connection.query(
        `INSERT INTO movie (id, title, year, director, duration, poster, rate)
          VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?);`,
        [title, year, director, duration, poster, rate]
      )
    } catch (e) {
      // puede enviarle información sensible
      throw new Error('Error creating movie')
      // enviar la traza a un servicio interno
      // sendLog(e)
    }

    const [movies] = await connection.query(
      `SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id
        FROM movie WHERE id = UUID_TO_BIN(?);`,
      [uuid]
    )

    return movies[0]
  }

  static async delete ({ id }) {
    // ejercio fácil: crear el delete
    const [succes_delete] = await connection.query(
      'DELETE FROM movie WHERE id = UUID_TO_BIN(?);',
      [id]
    )
    return succes_delete
  }

  static async update ({ id, input }) {
    // ejercicio fácil: crear el update
    const {
      title,
      year,
      duration,
      director,
      rate,
      poster
    } = input
    //The genre is not update because takes so much time to develop, this is a practical exercise
    try {
      const properties = Object.entries(input)
      for (const property of properties) {
        await connection.query(
         `UPDATE movie SET ${property[0]} = ? WHERE id = UUID_TO_BIN(?);`,
         [property[1], id]
        )
      }
    } catch (error) {
      throw new Error('error updating movie')
    }
  }
}