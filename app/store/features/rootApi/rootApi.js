import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

export const rootApi = createApi({
    reducerPath: 'api',
    tagTypes: [],
    baseQuery: fakeBaseQuery(),
    endpoints: (builder) => ({}),
});