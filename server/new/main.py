# %%
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.decomposition import PCA
import plotly.express as px
import pandas as pd

df = pd.read_csv("data.csv")
df
# Creating a text column (description + tags + title) for valid tfidf input
df['description'].fillna('', inplace=True)
df['tags'].fillna('', inplace=True)
df['text'] = df['title'] + ' ' + df['description'] + ' ' + df['tags']


# %%
# Vectorizing the text(TF-IDF)
tfidf = TfidfVectorizer(max_features=5000, stop_words='english')
X_tfidf = tfidf.fit_transform(df['text'])

# Splitting to test and train 80% to 20% split
X_train, X_test, y_train, y_test = train_test_split(X_tfidf, df['distracting'], test_size=0.2, random_state=42, stratify=df['distracting'])



# %%
# RFC WITH HYPERPARAMS
clf = RandomForestClassifier(n_estimators=300, max_depth=20, random_state=42)
clf.fit(X_train, y_train)

# Predict THAT SHITTTTTTTTTTT
y_pred = clf.predict(X_test)

# eVALUATING
report = classification_report(y_test, y_pred)
print(report)



# %%
# Standardizing before PCAing that shitttttttttttt
X_tfidf_dense = X_tfidf.toarray()
X_tfidf_standardized = (X_tfidf_dense - X_tfidf_dense.mean(axis=0)) / X_tfidf_dense.std(axis=0)

# %%
# Visualizing to see results
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_tfidf_standardized)
df_vis = pd.DataFrame({'PCA1': X_pca[:, 0], 'PCA2': X_pca[:, 1], 'Label': df['distracting'], 'Title': df['title']})

# Plotly
fig = px.scatter(df_vis, x='PCA1', y='PCA2', color=df_vis['Label'].astype(str), 
                 title='YouTube Videos Classification', 
                 labels={'Label': 'Distracting is 1 vs Not Distracting 0'},
                 opacity=0.6,
                 hover_data=['Title'])
fig.show()


