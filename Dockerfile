# Build step #1: build the React front end
FROM node:16-alpine as build-step
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY web/package.json web/package-lock.json ./
COPY web/src ./src
COPY web/public ./public
RUN npm install
RUN npm run build

FROM python:3.9
WORKDIR /app

COPY server/requirements.txt server/app.py ./
ADD server/data/* ./data/
COPY --from=build-step /app/build ./static_react
RUN ls -lh
RUN pip install -r ./requirements.txt
RUN pip install gunicorn
ENV FLASK_ENV production

EXPOSE 5000
CMD ["gunicorn", "-b", ":8000", "app:app"]

# Build: docker build -f Dockerfile -t momentos-web .
# Test:  docker run --rm -p 8000:8000 momentos-web  
# Persistent:  docker run -p 8000:8000 --mount type=bind,source="$(pwd -P)"/server/data,target=/app/data momentos-web