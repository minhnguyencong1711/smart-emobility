import type { UserProfile } from '@/types';

export type MockAccount = {
  email: string;
  password: string;
  profile: UserProfile;
};

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    email: 'student@vnuhcm.edu.vn',
    password: 'student123',
    profile: {
      id: 'usr-sv-01',
      fullName: 'Nguyễn Công Minh',
      email: 'student@vnuhcm.edu.vn',
      initials: 'CM',
      role: 'STUDENT',
      title: 'VNU-HCM Student',
    },
  },
  {
    email: 'binh.ta@hcmut.edu.vn',
    password: 'student123',
    profile: {
      id: 'usr-sv-02',
      fullName: 'Tạ Thanh Bình',
      email: 'binh.ta@hcmut.edu.vn',
      initials: 'TB',
      role: 'STUDENT',
      title: 'VNU-HCM Student',
    },
  },
  {
    email: 'operator@hcmut.edu.vn',
    password: 'operator123',
    profile: {
      id: 'usr-op-01',
      fullName: 'Trương Minh Trân',
      email: 'operator@hcmut.edu.vn',
      initials: 'MT',
      role: 'OPERATOR',
      title: 'Lead Hub Operator',
    },
  },
  {
    email: 'crew@vnuhcm.edu.vn',
    password: 'crew123',
    profile: {
      id: 'usr-fc-01',
      fullName: 'Đinh Phạm Ngọc Phước',
      email: 'crew@vnuhcm.edu.vn',
      initials: 'NP',
      role: 'FIELD_CREW',
      title: 'Field Operations Crew',
    },
  },
  {
    email: 'admin@hcmut.edu.vn',
    password: 'admin123',
    profile: {
      id: 'usr-ad-01',
      fullName: 'Nguyễn Đức Trọng',
      email: 'admin@hcmut.edu.vn',
      initials: 'ĐT',
      role: 'ADMIN',
      title: 'System Administrator',
    },
  },
];

export const DEMO_USERS: Record<
  'STUDENT' | 'OPERATOR' | 'FIELD_CREW',
  UserProfile
> = {
  STUDENT: MOCK_ACCOUNTS[0].profile,
  OPERATOR: MOCK_ACCOUNTS[2].profile,
  FIELD_CREW: MOCK_ACCOUNTS[3].profile,
};
