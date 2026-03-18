from typing import Dict, List
from fastapi import WebSocket
import json
import asyncio
from datetime import datetime

class ConnectionManager:
    """Manages WebSocket connections for real-time queue updates."""
    
    def __init__(self):
        # Store connections by room key (hospital_service_id:appointment_date)
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Store connection metadata for monitoring
        self.connection_metadata: Dict[WebSocket, Dict] = {}
    
    async def connect(self, websocket: WebSocket, room_key: str):
        """Accept websocket connection and add to room."""
        await websocket.accept()
        
        # Add connection to room
        if room_key not in self.active_connections:
            self.active_connections[room_key] = []
        
        self.active_connections[room_key].append(websocket)
        
        # Store connection metadata
        self.connection_metadata[websocket] = {
            "room_key": room_key,
            "connected_at": datetime.utcnow().isoformat()
        }
    
    def disconnect(self, websocket: WebSocket, room_key: str):
        """Remove websocket connection from room."""
        if room_key in self.active_connections:
            if websocket in self.active_connections[room_key]:
                self.active_connections[room_key].remove(websocket)
                
                # Clean up empty rooms
                if not self.active_connections[room_key]:
                    del self.active_connections[room_key]
        
        # Remove metadata
        if websocket in self.connection_metadata:
            del self.connection_metadata[websocket]
    
    async def broadcast(self, room_key: str, message: dict):
        """Broadcast message to all connections in a room."""
        if room_key not in self.active_connections:
            return
        
        # Add timestamp to message
        message["timestamp"] = datetime.utcnow().isoformat()
        
        # Create JSON message
        json_message = json.dumps(message)
        
        # Broadcast to all connections in room
        disconnected = []
        for connection in self.active_connections[room_key]:
            try:
                await connection.send_text(json_message)
            except Exception as e:
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection, room_key)

# Global connection manager instance
manager = ConnectionManager()
