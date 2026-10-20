# Upload MAI to your GitHub repository from Android

Repository: https://github.com/nickmaynanate06-create/Mai

1. Download `mai-starter.zip` and extract it on your phone.
2. Open the repository in your browser and choose **Add file → Upload files** (or the upload link shown in an empty repository).
3. Upload the contents of the extracted folder, keeping `web/` and `server/` as folders. Do not upload only the ZIP.
4. Commit with the message `Set up MAI starter project`.
5. To host the phone interface, use GitHub Pages with the `/web` folder via a suitable deployment workflow, or deploy the contents of `web/` as the Pages site root.

## Current capability
The browser UI is a local-first prototype. The API is suggest-only and returns a deterministic plan; it does not yet call an AI model or execute tools. The model provider adapter and persistent server-side database still need to be implemented and configured.

## Secrets
Never commit `.env`, model API keys, or `MAI_API_TOKEN`. Configure secrets in your deployment host.
