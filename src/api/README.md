# API Folder Structure

- `apiHelpers.ts`: Shared API request logic and error helpers.
- `types.ts`: All shared TypeScript interfaces/types.
- `authApi.ts`, `dealerApi.ts`, `deviceTypeApi.ts`: Real API modules, each focused on a resource.
- `index.ts`: Re-exports all main APIs for easier imports.
- `mocks/`: Contains all mock API modules for development/testing.

## Switching Between Real and Mock APIs

- Import from `mocks/` for development/testing, and from the main API files for production.
- Example:
  ```ts
  import { login } from './mocks/authApiMock'; // Mock
  import { login } from './authApi'; // Real
  ```

## Adding More APIs
- Keep naming consistent: `resourceApi.ts` and `mocks/resourceApiMock.ts`.
- Add new exports to `index.ts` if you want to re-export them.
