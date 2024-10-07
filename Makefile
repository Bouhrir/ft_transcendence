NAME = ft_transcendence

all : $(NAME)

$(NAME):
	docker-compose up --build -d

build:
	docker-compose build --no-cache
clean:
	docker-compose down
	docker volume prune -f

fclean: clean
	docker system prune -af

re: fclean all 

