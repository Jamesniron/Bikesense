# ─── Stage 1: Build Angular frontend ──────────────────────────────
FROM node:20-slim AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npx ng build --configuration production

# ─── Stage 2: Build ASP.NET Core backend ──────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /src
COPY backend/BikeSense.Api/BikeSense.Api.csproj .
RUN dotnet restore
COPY backend/BikeSense.Api/ .
RUN dotnet publish -c Release -o /app/publish --no-restore

# ─── Stage 3: Final runtime image ─────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=backend-build /app/publish .
COPY --from=frontend-build /frontend/dist/frontend/browser ./wwwroot

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["dotnet", "BikeSense.Api.dll"]
