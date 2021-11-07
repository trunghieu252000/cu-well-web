export interface IQuerryParams {
  page: number;
  limit: number;
  searchKey: string;
  sortField: string;
  sortType: 'asc' | 'sort';
}
