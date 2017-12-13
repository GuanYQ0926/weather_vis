import numpy as np
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM
from keras.layers import Dropout
from keras.layers.embeddings import Embedding
from keras.datasets import imdb
from keras.preprocessing import sequence


np.random.seed(7)

top_words = 5000
(x_train, y_train), (x_test, y_test) = imdb.load_data(nb_words=top_words)
max_review_length = 500
x_train = sequence.pad_sequences(x_train, maxlen=max_review_length)
x_test = sequence.pad_sequences(x_test, maxlen=max_review_length)

print(x_train[0])
print(y_train[0])

embedding_vector_length = 32
model = Sequential()
model.add(Embedding(top_words, embedding_vector_length,
                    input_length=max_review_length))
model.add(LSTM(100))
model.add(Dropout(0.2))
model.add(Dense(1, activation='sigmoid'))
model.compile(loss='binary_crossentropy',
              optimizer='adam', metrics=['accuracy'])
print(model.summary())
model.fit(x_train, y_train, nb_epoch=3, batch_size=64)
scores = model.evaluate(x_test, y_test, verbose=0)
print('Accuarcy: %.2f%%' % (scores[1] * 100))
