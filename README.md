# axios-patch-jwt version 2.0.7

# Description

This package will pass your user's creds inside `Heders.Authorization` for every request via axios.
It helps with JWT-way authorization systems.

# Usage

You need to run `configureAxiosJWTInterseptors(config);` at your project's root file.

Something like `index.tsx` where you call `ReactDOM.render()`;

### Config

```
{
    storage: (Your storage instance),
    axios: (Your axios instance),
    refreshTokenEndpoint: (link to your refresh-token API point),
    convertToCamelCase: (optional flag that provide info which case used your API)
```

Example with universal storage:

```
import { IAsyncStorage, WebStorageDecorator } from 'universal-storage';
import axios from 'axios';

const storage: IAsyncStorage = new WebStorageDecorator(localStorage);
configureAxiosJWTInterseptors({ storage, axios, refreshTokenEndpoint: '/api/auth' });
```

Now you can use saveCreds and clearCreads methods after login/logout in your app

Example:

```
const login = (data: ILoginPostData): Promise<any> =>
  axios
    .post(API_ROUTE, data)
    .then(async response => {
      await saveCreds(response.data.data);
      return response;
    })
    .catch(error => Promise.reject(error.response));


const logout = (): Promise<any> =>
  axios
    .delete(API_ROUTE)
    .then(async response => {
      await clearCreds();
      return response;
    })
    .catch(error => Promise.reject(error.response));
```

There are also a getCreds method for specific situations

Example:

```
const creds = await getCreds();
```

Where creds object looks like:

```
{
    access: {token: ''},
    refresh: {token: ''}
}
```
