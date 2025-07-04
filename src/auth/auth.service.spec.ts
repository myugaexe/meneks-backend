import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt'; // Import JwtService
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt'; // Import bcrypt

// Mock SupabaseClient secara global. Kita akan mengimplementasikannya secara dinamis
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(), // from akan di-mock secara dinamis di beforeEach atau dalam setiap tes
  })),
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)), // Mock hash
  compare: jest.fn((password, hashedPassword) => Promise.resolve(password === hashedPassword.replace('hashed_', ''))), // Mock compare
  hashSync: jest.fn((password) => `hashed_${password}`), // For initial data setup if needed
}));

// Mock JwtService
const mockJwtService = {
  sign: jest.fn((payload) => `mock_access_token_${payload.sub}`),
};

// Mock process.env
const mockProcessEnv = {
  SUPABASE_URL: 'http://mock.supabase.url',
  SUPABASE_SERVICE_ROLE_KEY: 'mock-key',
};

// Mock the global process object to ensure environment variables are available
const OLD_ENV = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV, ...mockProcessEnv };
});

afterAll(() => {
  process.env = OLD_ENV; // Restore old env
});

// Helper untuk membuat rantai mock Supabase Query Builder yang lengkap
const createSupabaseQueryMock = () => {
  const mockEq = jest.fn().mockReturnThis();
  const mockSingle = jest.fn();
  const mockSelect = jest.fn().mockReturnThis(); // For .select() after from() or insert()
  const mockInsert = jest.fn().mockReturnThis(); // For .insert()

  const chainableMethods = {
    select: mockSelect,
    eq: mockEq,
    single: mockSingle,
    insert: mockInsert, // Add insert to chainable methods
  };

  return {
    ...chainableMethods,
    mockEq: mockEq,
    mockSingle: mockSingle,
    mockSelectMethod: mockSelect,
    mockInsertMethod: mockInsert,
  };
};

describe('AuthService', () => {
  let service: AuthService;
  let supabaseMock: jest.Mocked<SupabaseClient>;
  let jwtServiceMock: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    supabaseMock = (createClient as jest.Mock).mock.results[0].value;
    jwtServiceMock = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
    jest.clearAllMocks(); // Bersihkan mock setiap sebelum tes
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // test SIGN UP
  describe('signup', () => {
    const mockSignupDto = {
      nomorInduk: '1234567',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should signup a new user', async () => {
      const mockUsersTable = createSupabaseQueryMock();

      // Mock the entire chain for signup: from().insert().select().single()
      (supabaseMock.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          // When .insert() is called, return the select method, then single()
          mockUsersTable.mockInsertMethod.mockReturnThis(); // insert returns itself for chaining
          mockUsersTable.mockSelectMethod.mockReturnThis(); // select after insert returns itself
          mockUsersTable.mockSingle.mockResolvedValueOnce({
            data: {
              id: 'new_user_id',
              nomorInduk: mockSignupDto.nomorInduk,
              name: mockSignupDto.name,
              email: mockSignupDto.email,
              role: 'siswa',
              password: 'hashed_password123', // This field is not returned in service, but good for mock consistency
            },
            error: null,
          });
          return mockUsersTable;
        }
        throw new Error(`Unexpected table name: ${tableName}`);
      });

      // Reset mock for bcrypt.hash (since it's globally mocked, ensure it's clean for this test)
      (bcrypt.hash as jest.Mock).mockClear();
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password123');

      // Reset mock for jwtService.sign
      jwtServiceMock.sign.mockClear();
      jwtServiceMock.sign.mockReturnValue('mock_access_token_new_user_id');

      const result = await service.signup(
        mockSignupDto.nomorInduk,
        mockSignupDto.name,
        mockSignupDto.email,
        mockSignupDto.password,
      );

      // Correct expectations for the returned object structure
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual({
        id: 'new_user_id',
        email: mockSignupDto.email,
        name: mockSignupDto.name,
        nomorInduk: mockSignupDto.nomorInduk,
        role: 'siswa',
      });
      expect(jwtServiceMock.sign).toHaveBeenCalledTimes(1);
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: 'new_user_id',
        email: mockSignupDto.email,
        role: 'siswa',
      });
      expect(supabaseMock.from).toHaveBeenCalledTimes(1);
      expect(supabaseMock.from).toHaveBeenCalledWith('users');
      expect(mockUsersTable.mockInsertMethod).toHaveBeenCalledTimes(1);
      expect(mockUsersTable.mockSelectMethod).toHaveBeenCalledTimes(1);
      expect(mockUsersTable.mockSingle).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockSignupDto.password, 10);
    });

    it('should throw error if invalid nomorInduk', async () => {
        await expect(service.signup('123', 'Test', 'test@example.com', 'password123')).rejects.toThrow('Invalid Identification number');
        // Pastikan tidak ada interaksi Supabase jika validasi nomorInduk gagal
        expect(supabaseMock.from).not.toHaveBeenCalled();
        expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should throw error if insert fails', async () => {
      const mockUsersTable = createSupabaseQueryMock();
      (supabaseMock.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          mockUsersTable.mockInsertMethod.mockReturnThis();
          mockUsersTable.mockSelectMethod.mockReturnThis();
          mockUsersTable.mockSingle.mockResolvedValueOnce({
            data: null,
            error: { message: 'Insert failed from Supabase' },
          });
          return mockUsersTable;
        }
        throw new Error(`Unexpected table name: ${tableName}`);
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password123'); // Ensure hash works

      await expect(
        service.signup(
          mockSignupDto.nomorInduk,
          mockSignupDto.name,
          mockSignupDto.email,
          mockSignupDto.password,
        ),
      ).rejects.toThrow('Insert failed from Supabase');

      expect(supabaseMock.from).toHaveBeenCalledTimes(1);
      expect(supabaseMock.from).toHaveBeenCalledWith('users');
      expect(mockUsersTable.mockInsertMethod).toHaveBeenCalledTimes(1);
      expect(mockUsersTable.mockSelectMethod).toHaveBeenCalledTimes(1);
      expect(mockUsersTable.mockSingle).toHaveBeenCalledTimes(1);
      expect(jwtServiceMock.sign).not.toHaveBeenCalled(); // Should not sign token if insert fails
    });
  });

  // test SIGN IN
  describe('signin', () => {
    const mockSigninDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const mockUserInDb = {
      id: 'existing_user_id',
      email: mockSigninDto.email,
      password: 'hashed_password123', // This comes from bcrypt.hashSync in the global mock initially
      name: 'Existing User',
      nomorInduk: '9876543',
      role: 'siswa',
    };

    it('should signin a user with correct credentials', async () => {
      const mockUsersTable = createSupabaseQueryMock();

      // Mock the entire chain for signin: from().select().eq().single()
      (supabaseMock.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          mockUsersTable.mockSelectMethod.mockReturnThis(); // select returns itself for chaining
          mockUsersTable.mockEq.mockReturnThis(); // eq returns itself for chaining
          mockUsersTable.mockSingle.mockResolvedValueOnce({
            data: mockUserInDb,
            error: null,
          });
          return mockUsersTable;
        }
        throw new Error(`Unexpected table name: ${tableName}`);
      });

      // Reset mock for bcrypt.compare (since it's globally mocked)
      (bcrypt.compare as jest.Mock).mockClear();
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Password matches

      // Reset mock for jwtService.sign
      jwtServiceMock.sign.mockClear();
      jwtServiceMock.sign.mockReturnValue('mock_access_token_existing_user_id');

      const result = await service.signin(mockSigninDto.email, mockSigninDto.password);

      // Correct expectations for the returned object structure
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual({
        id: mockUserInDb.id,
        email: mockUserInDb.email,
        name: mockUserInDb.name,
        nomorInduk: mockUserInDb.nomorInduk,
        role: mockUserInDb.role,
      });
      expect(jwtServiceMock.sign).toHaveBeenCalledTimes(1);
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: mockUserInDb.id,
        email: mockUserInDb.email,
        role: mockUserInDb.role,
      });
      expect(supabaseMock.from).toHaveBeenCalledTimes(1);
      expect(supabaseMock.from).toHaveBeenCalledWith('users');
      expect(mockUsersTable.mockSelectMethod).toHaveBeenCalledTimes(1);
      expect(mockUsersTable.mockEq).toHaveBeenCalledWith('email', mockSigninDto.email);
      expect(mockUsersTable.mockSingle).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith(mockSigninDto.password, mockUserInDb.password);
    });

    it('should throw error if user not found', async () => {
      const mockUsersTable = createSupabaseQueryMock();
      (supabaseMock.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          mockUsersTable.mockSelectMethod.mockReturnThis();
          mockUsersTable.mockEq.mockReturnThis();
          mockUsersTable.mockSingle.mockResolvedValueOnce({
            data: null,
            error: { message: 'User not found' },
          });
          return mockUsersTable;
        }
        throw new Error(`Unexpected table name: ${tableName}`);
      });

      await expect(service.signin(mockSigninDto.email, mockSigninDto.password)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(supabaseMock.from).toHaveBeenCalledTimes(1);
      expect(supabaseMock.from).toHaveBeenCalledWith('users');
      expect(mockUsersTable.mockSelectMethod).toHaveBeenCalledTimes(1);
      expect(mockUsersTable.mockEq).toHaveBeenCalledWith('email', mockSigninDto.email);
      expect(mockUsersTable.mockSingle).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).not.toHaveBeenCalled(); // Should not compare password if user not found
      expect(jwtServiceMock.sign).not.toHaveBeenCalled();
    });

    it('should throw error if wrong password', async () => {
      const mockUsersTable = createSupabaseQueryMock();
      (supabaseMock.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          mockUsersTable.mockSelectMethod.mockReturnThis();
          mockUsersTable.mockEq.mockReturnThis();
          mockUsersTable.mockSingle.mockResolvedValueOnce({
            data: mockUserInDb, // User found
            error: null,
          });
          return mockUsersTable;
        }
        throw new Error(`Unexpected table name: ${tableName}`);
      });

      (bcrypt.compare as jest.Mock).mockClear();
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Password does not match

      await expect(service.signin(mockSigninDto.email, 'wrong_password')).rejects.toThrow(
        'Wrong password',
      );
      expect(supabaseMock.from).toHaveBeenCalledTimes(1);
      expect(supabaseMock.from).toHaveBeenCalledWith('users');
      expect(mockUsersTable.mockSelectMethod).toHaveBeenCalledTimes(1);
      expect(mockUsersTable.mockEq).toHaveBeenCalledWith('email', mockSigninDto.email);
      expect(mockUsersTable.mockSingle).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong_password', mockUserInDb.password);
      expect(jwtServiceMock.sign).not.toHaveBeenCalled(); // Should not sign token if password is wrong
    });
  });
});