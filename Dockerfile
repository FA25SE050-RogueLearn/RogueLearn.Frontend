# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS base

# Set the working directory in the container
WORKDIR /app

# The 'deps' stage installs dependencies
FROM base AS deps
# Copy dependency definition files
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# Install dependencies based on the lock file present
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# The 'builder' stage builds the Next.js application
FROM base AS builder
WORKDIR /app
# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application files
COPY . .
# Build the application for production
RUN npm run build

# The 'runner' stage creates the final, lean production image
FROM base AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy production-ready files from the 'builder' stage
COPY --from=builder /app/public ./public
# Copy the standalone Next.js server output
COPY --from=builder /app/.next/standalone ./
# Copy static assets
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3000
# Use key=value format for environment variables to resolve the warning.
ENV PORT=3000

# The command to start the Next.js server
CMD ["node", "server.js"]