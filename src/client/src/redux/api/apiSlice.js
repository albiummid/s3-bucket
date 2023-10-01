import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API_HOST = "http://localhost:5000";

const baseQuery = fetchBaseQuery({
  baseUrl: API_HOST,
  mode: "no-cors",
  prepareHeaders: async (headers, { getState, endpoint }) => {
    headers.set("Access-Control-Allow-Origin", "*");
    //   const token = getState()?.auth?.accessToken
    //   if (token) {
    //     headers.set('Authorization', `Bearer ${token}`)
    //   }

    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result?.error?.status === 401) {
      // api.dispatch(userLoggedOut())
      // localStorage.clear()
    }
    return result;
  },
  tagTypes: ["user"],
  endpoints: (builder) => ({}),
});
