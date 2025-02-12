import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LoginRequest, RegisterRequest, User } from './type';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }
      const data: User = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue("server error");
    }
  }
);

// Async thunk for signup
export const signUp = createAsyncThunk(
  'auth/signUp',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error('Signup failed');
      }
      const data: User = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue("server error");
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
    //   .addCase(login.rejected, (state, action: PayloadAction<SerializedError>) => {
    //     state.loading = false;
    //     state.error = action.payload.message || "Login failed";
    //   })
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
    //   .addCase(signUp.rejected, (state, action: PayloadAction<SerializedError>) => {
    //     state.loading = false;
    //     state.error = action.payload.message || "Signup failed";
    //   });
  },
});

export const { logout, updateUser } = authSlice.actions;

export default authSlice.reducer;
