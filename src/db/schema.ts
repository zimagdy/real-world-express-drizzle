import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  serial,
  primaryKey,
} from 'drizzle-orm/pg-core'
//@ts-ignore
import { defineRelations } from 'drizzle-orm'

// Define schemas
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 20 }).notNull().unique(),
  email: varchar('email', { length: 250 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  bio: text('bio').default(''),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 260 }).notNull().unique(),
  title: varchar('title', { length: 250 }).notNull(),
  description: varchar('description', { length: 512 }).notNull(),
  body: text('body').notNull(),
  favoritesCount: integer('favorites_count').default(0),
  authorId: uuid('author_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  taglist: text('tag_list').array().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(), // response expect integer
  body: text('body').notNull(),
  articleId: uuid('article_id')
    .references(() => articles.id, { onDelete: 'cascade' })
    .notNull(),
  authorId: uuid('author_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const favorites = pgTable(
  'favorites',
  {
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    articleId: uuid('article_id')
      .references(() => articles.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.userId, table.articleId],
    }),
  }),
)

export const follows = pgTable(
  'follows',
  {
    followerId: uuid('follower_id') // The user who is following
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    followedId: uuid('followed_id') // The user being followed
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.followerId, table.followedId],
    }),
  }),
)

// Define realtions
export const userArticleCommentRelation = defineRelations(
  { users, articles, comments },
  (r) => ({
    articles: {
      author: r.one.users({
        from: r.articles.authorId,
        to: r.users.id,
      }),
      comments: r.many.comments(),
    },
    users: {
      articles: r.many.articles(),
      comments: r.many.comments(),
    },
    comments: {
      article: r.one.articles({
        from: r.comments.articleId,
        to: r.articles.id,
      }),

      author: r.one.users({
        from: r.comments.authorId,
        to: r.users.id,
      }),
    },
  }),
)

export const userFavoriteRelation = defineRelations(
  { users, articles, favorites },
  (r) => ({
    favorites: {
      favoriteUser: r.one.users({
        from: r.favorites.userId,
        to: r.users.id,
      }),

      favoriteArticle: r.one.articles({
        from: r.favorites.articleId,
        to: r.articles.id,
      }),
    },
    users: {
      favorites: r.many.favorites(),
    },
    articles: {
      favorites: r.many.favorites(),
    },
  }),
)

export const userFollowRelation = defineRelations({ users, follows }, (r) => ({
  follows: {
    follower: r.one.users({
      from: r.follows.followerId,
      to: r.users.id,
    }),
    followed: r.one.users({
      from: r.follows.followedId,
      to: r.users.id,
    }),
  },
  users: {
    followers: r.many.follows({
      from: r.users.id,
      to: r.follows.followedId,
    }),

    following: r.many.follows({
      from: r.users.id,
      to: r.follows.followerId,
    }),
  },
}))
