# SmartQueue - Hospital Queue Management System

A comprehensive hospital queue management and verification system built with React (frontend) and Flask (backend).

## 🏥 Features

- **Patient Queue Management**: Join hospital queues remotely
- **Hospital Verification**: Government hospital credential verification
- **Real-time Search**: Find nearby hospitals by location
- **Medical Problem Matching**: Get hospitals specialized in your medical needs
- **Staff Dashboard**: Manage hospital operations and queues
- **Database Integration**: MongoDB-compatible JSON database with government hospital data

## 📁 Project Structure

```
smartqueue/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── assets/          # Static assets
│   │   └── main.jsx         # React entry point
│   ├── public/             # Public assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── backend/                 # Flask backend API
│   ├── app/                # Flask application modules
│   ├── data/               # Database files (JSON)
│   ├── flask_backend.py     # Main Flask application
│   └── requirements.txt    # Python dependencies
├── package.json            # Root package configuration
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+ and pip

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smartqueue
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start:
- Frontend: http://localhost:5173 (Vite dev server)
- Backend: http://localhost:5000 (Flask API)

### Individual Development

- **Frontend only**: `npm run dev:frontend`
- **Backend only**: `npm run dev:backend`

## 📊 Database

The system uses a JSON-based database with:
- **15 Government Hospitals**: From NTR Vaidya Seva program
- **3 Private Hospitals**: Major private healthcare providers
- **Full Coverage**: All 13 districts of Andhra Pradesh

### Database Statistics
- Total Hospitals: 18
- States Covered: Andhra Pradesh, Telangana
- Districts Covered: 13 districts
- Specialities: General Medicine, Surgery, Maternity, Pediatrics, Orthopedics, Cardiology, Emergency

## 🔧 API Endpoints

### Hospital Management
- `GET /` - API information
- `GET /health` - Health check
- `GET /hospitals/nearby` - Find nearby hospitals
- `GET /hospitals/` - List hospitals with filters
- `GET /hospital/<id>` - Get hospital details
- `POST /hospital/register` - Register new hospital

### Verification
- `POST /verification/hospital` - Verify hospital credentials
- `GET /verification/statistics` - Verification statistics

### Database
- `GET /database/stats` - Database statistics

## 🏗️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling framework
- **React Router** - Navigation
- **Lucide Icons** - Icon library

### Backend
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin requests
- **Python 3.13** - Runtime environment
- **JSON Database** - Data storage

## 🎯 Key Features

### Patient Features
- Medical problem selection with smart matching
- Location-based hospital search
- Queue joining with patient details
- Real-time hospital availability
- Distance-based sorting

### Hospital Features
- Government hospital verification
- Private hospital registration
- Staff dashboard for queue management
- Patient queue monitoring
- Speciality-based filtering

### Verification System
- Government database integration
- Multi-source verification (PM-JAY, Aarogyasri, NHM)
- Geospatial verification
- Scoring and badge system

## 📱 Responsive Design

- Mobile-first approach
- Touch-friendly interface
- Progressive enhancement
- Cross-browser compatibility

## 🔒 Security Features

- Input validation and sanitization
- CORS protection
- Rate limiting ready
- Secure data handling

## 🚀 Deployment

### Frontend Build
```bash
npm run build
```

### Production Setup
1. Build the frontend: `npm run build`
2. Deploy backend to production server
3. Configure environment variables
4. Set up reverse proxy (nginx/Apache)

## 📈 Performance

- Optimized bundle sizes
- Lazy loading components
- Efficient API calls
- Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the API endpoints
- Examine the database structure
- Contact the development team

---

**SmartQueue** - Making healthcare accessible and efficient for everyone. 🏥✨
