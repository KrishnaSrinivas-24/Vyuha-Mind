import os
import threading
from typing import List, Optional

class GeminiKeyManager:
    """
    Manages a pool of Gemini API keys with sequential rotation on failure.
    Ensures zero-downtime for the simulator during high-traffic hackathon pitches.
    """
    def __init__(self, keys: List[str]):
        self._keys = [k.strip() for k in keys if k.strip()]
        self._current_index = 0
        self._lock = threading.Lock()
        
        # Override environment if keys provided
        if self._keys:
            os.environ["GOOGLE_API_KEY"] = self._keys[0]

    @property
    def current_key(self) -> Optional[str]:
        with self._lock:
            if not self._keys:
                return os.environ.get("GOOGLE_API_KEY")
            return self._keys[self._current_index]

    def rotate_key(self) -> Optional[str]:
        """Switch to the next available key in the pool."""
        with self._lock:
            if not self._keys:
                return None
            
            self._current_index = (self._current_index + 1) % len(self._keys)
            new_key = self._keys[self._current_index]
            
            # Update environment so other libs (like ADK) see the new key
            os.environ["GOOGLE_API_KEY"] = new_key
            display_key = f"{new_key[:8]}..." if new_key else "None"
            print(f"🔄 Rotated to Gemini API Key #{self._current_index + 1} ({display_key})")
            return new_key

    def get_all_keys(self) -> List[str]:
        return self._keys

# Load keys from environment variable (comma-separated)
# Format: GEMINI_KEYS=key1,key2,key3
keys_env = os.getenv("GEMINI_KEYS", "")
keys_pool = [k.strip() for k in keys_env.split(",") if k.strip()]

# Failback to a single GOOGLE_API_KEY if the pool is empty
if not keys_pool:
    single_key = os.getenv("GOOGLE_API_KEY")
    if single_key:
        keys_pool = [single_key]

key_manager = GeminiKeyManager(keys_pool)
