// Welcome to Keystone!
//
// This file is what Keystone uses as the entry-point to your headless backend
//
// Keystone imports the default export of this file, expecting a Keystone configuration object
//   you can find out more at https://keystonejs.com/docs/apis/config

import { config } from '@keystone-6/core'

// to keep this file tidy, we define our schema in a different file
import { lists } from './schema'

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// authentication is configured separately here too, but you might move this elsewhere
// when you write your list-level access control functions, as they typically rely on session data
import { withAuth, session } from './auth'

import { PrismaPg } from '@prisma/adapter-pg'

export default withAuth(
  config({
    db: {
      // we're using postgresql
      //   for more information on what database might be appropriate for you
      //   see https://keystonejs.com/docs/guides/choosing-a-database#title
      provider: 'postgresql',
      prismaClientOptions: () => ({
        adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
      }),
      async onConnect(context) {
        // this creates an initial user if none exist so you can log in for development
        // WARNING: do not use this in production
        const sudoContext = context.sudo()
        if ((await sudoContext.db.User.count()) !== 0) return

        const password = crypto.getRandomValues(new Uint8Array(16)).toHex()
        await sudoContext.db.User.createOne({
          data: { name: 'admin', email: 'admin@example.com', password },
        })
        console.log(`Created initial user: admin@example.com / ${password}`)
      },
    },
    lists,
    session,
  })
)
