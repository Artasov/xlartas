```sh
docker run --rm ` -e SONAR_HOST_URL="https://sonar.xlartas.ru" ` -e SONAR_TOKEN="sqp_1a7be86cf62569b5640c83c6c31b8261815becf2" ` -v "${PWD}:/usr/src" ` sonarsource/sonar-scanner-cli
```
```sh
pytest -c pytest.ini --cov=. --cov-report=xml:coverage.xml
```