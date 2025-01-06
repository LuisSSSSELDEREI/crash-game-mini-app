FROM python:3.11

COPY requirements.txt .


RUN python3 -m pip install pip --upgrade

RUN pip install -r requirements.txt

RUN pip install pyopenssl --upgrade

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--worker-class", "eventlet", "--bind", "0.0.0.0:5000", "wsgi:app"]

