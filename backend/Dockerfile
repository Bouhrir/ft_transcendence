FROM python:3.8-slim

RUN apt-get update -y && apt-get install gcc -y 

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1


# Install dependencies
RUN pip install --upgrade pip
COPY tools/dependencies.txt .
RUN pip install -r ./dependencies.txt

# Copy project
COPY ./project /project
COPY tools/script.sh /
RUN chmod +x /script.sh

WORKDIR /project
RUN python -m venv .env
RUN echo "source .env/bin/activate" >> ~/.bashrc
EXPOSE 8000

CMD ["/bin/bash", "/script.sh"]