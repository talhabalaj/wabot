FROM python:3.10

WORKDIR /app

RUN python3 -m pip install pipenv
COPY Pipfile Pipfile.lock ./
RUN pipenv install --system --deploy --ignore-pipfile
COPY . .

CMD [ "python", "src/image_editor_server.py" ]
