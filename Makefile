.PHONY: up
up: certs
	docker compose up -d

certs:
	$(MAKE) certs/tls.crt || ( rm -rf $@; exit 1 )

certs/tls.key:
	-mkdir $(dir $@) || true
	openssl genrsa 2048 > $@

certs/tls.crt: certs/tls.key
	openssl x509 -new -subj /CN=localhost -key certs/tls.key -out certs/tls.crt

.PHONY: logs
logs:
	docker compose logs -f

.PHONY: down
down:
	docker compose down

.PHONY: clean
clean:
	@rm -rf certs
