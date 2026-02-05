# SmartQueue Backend - Hospital Queue Management System

## 🏥 Project Overview
FastAPI backend for hospital queue management and verification system focused on Andhra Pradesh, India.

## 🎯 Purpose
- Manage hospital registrations and data
- Provide APIs for React frontend
- Handle hospital queue system operations
- Serve hospital data for search and filtering
- Hospital verification and staff authentication

## 🛠️ Technology Stack
- **Backend**: FastAPI 0.104.1 (Modern Python Web Framework)
- **Server**: Uvicorn 0.24.0 (ASGI Server)
- **Database**: JSON files (mock database)
- **Validation**: Pydantic 2.5.0 (Data validation)
- **Environment**: Python-dotenv for configuration

## 📁 Project Structure
```
backend/
├── fastapi_backend.py      # Main FastAPI application (500+ lines)
├── requirements-fastapi.txt # Python dependencies (5 packages)
├── .env                    # Environment variables
├── .env.example           # Environment variables template
├── README.md              # This file
└── data/
    ├── hospitals_clean.json     # Government hospital data
    ├── kakinada_all_mandals.json # Kakinada hospital database
    └── verified_hospitals.json  # Verified hospitals storage
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ installed
- Virtual environment recommended

### Installation
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements-fastapi.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run the FastAPI server:
   ```bash
   python fastapi_backend.py
   # OR
   uvicorn fastapi_backend:app --reload --host 0.0.0.0 --port 8000
   ```

The server will start on `http://localhost:8000`

### 📚 API Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

## 📡 API Endpoints

### Health & Status
- `GET /` - Health check and server status
- `GET /stats` - Get system statistics

### Hospital Management
- `GET /hospitals` - Get all hospitals with filtering and pagination
- `POST /hospital/register` - Register new hospital
- `GET /hospital/{id}` - Get hospital by ID

### Verification System
- `POST /hospital/verify` - Verify hospital details
- `GET /verified/hospitals` - Get all verified hospitals

### Authentication
- `POST /staff/login` - Staff authentication

### Data & Reference
- `GET /districts` - Get available districts
- `GET /specialities` - Get available specialities

## 🏥 Hospital Data

### Government Hospitals
- **Source**: NTR Vaidya Seva
- **Count**: 15+ hospitals
- **Coverage**: All 26 districts of Andhra Pradesh
- **Fields**: Name, type, address, specialities, contact info

### Kakinada Database
- **Source**: Kakinada All Mandals Database
- **Purpose**: Hospital verification system
- **Fields**: Name, State, District, Mandal, Mitra Contact No, Pincode

### Private Hospitals
- **Source**: Mock data for demonstration
- **Features**: Emergency services, ambulance, bed count

## 🔧 Configuration

### Environment Variables (.env)
```bash
# FastAPI Configuration
FASTAPI_ENV=development
FASTAPI_DEBUG=True

# CORS Settings
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173

# Database Settings
DATA_PATH=./data
```

## 📊 Features

### Hospital Search & Filtering
- **Pagination**: Skip/limit parameters
- **Filters**: City, state, district, type, verification status
- **Sorting**: Automatic sorting by creation date

### Registration System
- **Pydantic Validation**: Automatic data validation
- **Type Safety**: Full type hints throughout
- **Error Handling**: Proper HTTP status codes
- **Staff Credentials**: Built-in staff login system

### Verification System
- **Database Matching**: Verify against Kakinada database
- **Verification Badge**: ⭐⭐⭐⭐⭐ rating system
- **Staff Access**: Login credentials for verified hospitals
- **Duplicate Prevention**: Avoid duplicate verifications

### API Documentation
- **Auto-generated**: Swagger UI and ReDoc
- **Type Hints**: Complete Pydantic models
- **Examples**: Request/response examples
- **Interactive**: Try API endpoints directly

## 🌐 Frontend Integration

### CORS Configuration
- Configured for React development servers
- Supports multiple origins (localhost:3000, localhost:5173)
- Secure cross-origin requests

### Data Format
- JSON responses for all endpoints
- Consistent error handling
- Structured hospital data format
- Automatic data validation

## 🔍 Data Structure

### Hospital Registration Model
```python
class HospitalRegistration(BaseModel):
    name: str
    type: str  # Government|Private|Trust
    address: str
    city: str
    state: str = "Andhra Pradesh"
    district: str
    mandal: str
    pincode: str  # 6 digits
    phone: str   # 10 digits
    beds: int    # 1-10000
    emergencyServices: bool = True
    ambulanceServices: bool = False
    adminName: str
    adminEmail: str  # Email validation
    adminPhone: str  # 10 digits
    adminPosition: str
    specialities: List[str]  # Min 1 item
    mitraContactNo: str  # 10 digits
    staffId: str
    password: str  # Min 6 chars
```

### Verification Request Model
```python
class VerificationRequest(BaseModel):
    hospital_name: str
    state: str
    district: str
    mandal: str
    mitra_contact_no: str  # 10 digits
    pincode: str  # 6 digits
    staff_id: Optional[str] = None
    password: Optional[str] = None
```

## 🛠️ Development

### Adding New Endpoints
1. Define Pydantic models for request/response
2. Create async endpoint functions
3. Add proper error handling
4. Update API documentation

### Data Validation
- **Pydantic Models**: Automatic validation
- **Field Validators**: Custom validation rules
- **Type Safety**: Full type hints
- **Error Messages**: User-friendly error responses

## 📝 Dependencies

### FastAPI Requirements (`requirements-fastapi.txt`)
```
fastapi==0.104.1          # Modern Python web framework
uvicorn[standard]==0.24.0 # ASGI server with hot reload
python-dotenv==1.0.0      # Environment variables
pydantic==2.5.0           # Data validation and serialization
requests==2.31.0          # HTTP client for external APIs
```

## 🚨 FastAPI Advantages

### Performance
- **ASGI Support**: Async/await support
- **High Performance**: One of the fastest Python frameworks
- **Automatic Documentation**: Swagger UI and ReDoc
- **Type Safety**: Full type hints support

### Developer Experience
- **Interactive Docs**: Try API endpoints in browser
- **Auto-validation**: Pydantic models for data validation
- **Modern Python**: Latest Python features
- **IDE Support**: Excellent autocomplete and type checking

### Production Ready
- **Standards Compliant**: OpenAPI and JSON Schema
- **Security**: Built-in security features
- **Extensible**: Easy to add middleware
- **Scalable**: Handles high concurrent requests

## 📞 Support

For issues or questions:
1. Check the API documentation at `http://localhost:8000/docs`
2. Verify environment variables and dependencies
3. Ensure frontend is running on configured CORS origins
4. Check data file formats and permissions

---

**SmartQueue FastAPI Backend** - Modern, Fast, and Type-Safe Hospital Management API
