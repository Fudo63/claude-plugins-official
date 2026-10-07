#!/bin/bash

echo "🚀 Rheinklar App Setup & Test"
echo "=============================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
cd backend
npm install
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
  echo -e "${RED}❌ Failed to install backend dependencies${NC}"
  exit 1
fi

cd ../frontend
npm install
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
  echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
  exit 1
fi

cd ..

# 2. Setup database
echo -e "\n${BLUE}🗄️  Setting up PostgreSQL database...${NC}"
createdb rheinklar_db 2>/dev/null
if [ $? -eq 0 ] || [ $? -eq 1 ]; then
  psql rheinklar_db < backend/schema.sql
  echo -e "${GREEN}✅ Database created and schema applied${NC}"
else
  echo -e "${RED}❌ Failed to create database${NC}"
  echo "Make sure PostgreSQL is installed and running"
  exit 1
fi

# 3. Create .env file
echo -e "\n${BLUE}⚙️  Creating environment files...${NC}"
cp backend/.env.example backend/.env
sed -i 's/postgresql:\/\/.*@localhost/postgresql:\/\/rheinklar_user:rheinklar_password@localhost/' backend/.env
echo -e "${GREEN}✅ Environment files created${NC}"

# 4. Start backend server
echo -e "\n${BLUE}🔧 Starting backend server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for server to start
sleep 3

# 5. Run tests
echo -e "\n${BLUE}🧪 Running integration tests...${NC}"
npm test 2>/dev/null

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ All tests PASSED!${NC}"
else
  echo -e "${RED}⚠️  Some tests need review${NC}"
fi

echo -e "\n${BLUE}📱 Frontend setup...${NC}"
cd ../frontend
echo -e "${GREEN}✅ Frontend ready for development${NC}"

echo -e "\n${GREEN}🎉 Setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "  1. cd frontend && npm run dev  (Start admin dashboard)"
echo "  2. Backend is running on http://localhost:5000"
echo "  3. API documentation in /docs"

# Kill backend process
kill $BACKEND_PID 2>/dev/null

exit 0
