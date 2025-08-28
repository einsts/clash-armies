/**
 * 数据转换器基类
 */

export abstract class BaseTransformer<T, R> {
  /**
   * 将单个数据转换为APP格式
   */
  abstract toAppFormat(data: T): R;
  
  /**
   * 将数据列表转换为APP格式
   */
  toAppFormatList(dataList: T[]): R[] {
    return dataList.map(data => this.toAppFormat(data));
  }
  
  /**
   * 格式化日期
   */
  protected formatDate(date: Date): string {
    return date.toISOString();
  }
  
  /**
   * 格式化数字（保留两位小数）
   */
  protected formatNumber(num: number): number {
    return Math.round(num * 100) / 100;
  }
  
  /**
   * 格式化布尔值
   */
  protected formatBoolean(value: boolean | number): boolean {
    if (typeof value === 'number') {
      return value === 1;
    }
    return value;
  }
  
  /**
   * 安全获取嵌套属性
   */
  protected safeGet<T>(obj: any, path: string, defaultValue: T): T {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current == null || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[key];
    }
    
    return current !== undefined ? current : defaultValue;
  }
}
