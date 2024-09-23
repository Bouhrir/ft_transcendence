NAME = ft_transcendence

all : $(NAME)

$(NAME):
	docker-compose up --build -d 

stop:
	docker-compose down

fclean:
	docker-compose down
	docker volume prune -f
	docker system prune -af

re:
	docker-compose down
	docker-compose up --build -d 

