FROM python:3.8-slim

RUN apt-get update -y && apt-get install gcc -y 

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1


# Install dependencies
RUN pip install --upgrade pip
COPY tools/dependencies.txt .
RUN pip3 install -r ./dependencies.txt

# Copy project
COPY ./project /project
COPY tools/script.sh /
RUN chmod +x /script.sh

# Set work directory
WORKDIR /project
RUN python -m venv .env
RUN echo "source .env/bin/activate" >> ~/.bashrc
RUN python3 manage.py collectstatic
RUN python3 manage.py makemigrations && python3 manage.py migrate
EXPOSE 8000

# CMD ["python", "manage.py", "runserver"]
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "setup.asgi:application"]