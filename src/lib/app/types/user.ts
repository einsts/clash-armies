/**
 * APP用户相关类型定义
 */

// APP用户数据格式
export interface AppUser {
  id: number;
  username: string;
  playerTag?: string;
  level?: number;
  roles: string[];
  createdAt: string;
}

// 用户统计信息
export interface UserStats {
  totalArmies: number;
  totalLikes: number;
  totalViews: number;
  totalComments: number;
  averageScore: number;
  joinDate: string;
  lastActive: string;
}

// 用户设备信息
export interface UserDevice {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  lastLoginAt: string;
  isActive: boolean;
}
