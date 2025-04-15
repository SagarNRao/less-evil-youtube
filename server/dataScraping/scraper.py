from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

import pandas as pd

chrome_options = Options()
chrome_options.add_argument("--headless")  # Run in headless mode
# Disable GPU acceleration (optional)
chrome_options.add_argument("--disable-gpu")
# Set window size (optional)
chrome_options.add_argument("--window-size=1920,1080")
# Bypass OS security model (useful for CI/CD)
chrome_options.add_argument("--no-sandbox")
# Overcome limited resource problems
chrome_options.add_argument("--disable-dev-shm-usage")

website = 'https://www.youtube.com'
path = 'C:/Users/username/Downloads/chromedriver_win32/chromedriver.exe'
driver = webdriver.Chrome(options=chrome_options)

driver.get(website)

search_box = driver.find_element(
    "xpath", '/html/body/ytd-app/div[1]/div[2]/ytd-masthead/div[4]/div[2]/yt-searchbox/div[1]/form/input')
search_box.click()


def search(query):
    df = pd.DataFrame(columns=["id", "title", "description",
                               'topic_categories' "thumbnail", "tags", "distracting"])
    search_box.send_keys(query)
    search_box.send_keys(Keys.RETURN)
    search_box.click()

    time.sleep(5)

    for i in range(20):
        driver.execute_script(
            "window.scrollTo(0, document.documentElement.scrollHeight);"
        )
        time.sleep(3)

    wait = WebDriverWait(driver, 5)
    video_renderers = wait.until(EC.presence_of_all_elements_located(
        (By.CSS_SELECTOR, "ytd-video-renderer")
    ))

    for video in video_renderers:
        try:
            # Find the title element and get its text
            title = video.find_element(By.CSS_SELECTOR, "#video-title").text
            print(f"Video Title: {title}")

            # Get description using the correct selector
            desc = video.find_element(
                By.CSS_SELECTOR, ".metadata-snippet-text").text
            print(f"Description: {desc}")

            # Get video link (href attribute)
            link = video.find_element(
                By.CSS_SELECTOR, "#video-title").get_attribute("href")
            print(f"Video Link: {link}")

            video_id = link.split("v=")[1].split("&")[0]
            print(f"Video ID: {video_id}")

            new_row = pd.DataFrame([{
                "id": video_id,
                "title": title,
                "description": desc,
                'topic_categories': "['Entertainment', 'memes']",
                "category": 27,
                "thumbnail": "",
                "tags": "",
                "distracting": 0
            }])

            # Concatenate the new row with the existing DataFrame
            df = pd.concat([df, new_row], ignore_index=True)

            print("-------------------")
            df.to_csv(f'{query}.csv', index=False)

            search_box.send_keys(Keys.CONTROL, "a")
            search_box.send_keys(Keys.DELETE)

        except Exception as e:
            print(f"Error extracting video data: {e}")
            continue


# memeTopics = ["vines", "brainrot", "shitposts"]
# animeTopics = ["solo leveling", "anime moments", "shonen anime"]
# gamingTopics = ["valorant", "League of Legends"]

# for topic in animeTopics:
#     search(topic)

# for topic in gamingTopics:
#     search(topic)

# mathsTopics = ["Calculus", "How to find area under the curve using calculus", "integral calculus" ]
# agileTopics = ["Agile", "Scrum", "Scrum roles", "XP", "Kanban"]
IMLTopics = ["kmeans", "clustering", "PCA Analysis", "AI/ML", "Artificial Intelligence", "generative AI", "Random Forest",
             "Gradient Descent", "Decision Tree", "Confusion matrix", "Hyperparameter tuning", "Convolutional Neural Networks"]
# progTopics = ["nextjs", "DBMS", "binary trees", ]
# fitnessTopics = ["diet for bulking", "diet for cutting", "brain boosting foods", "how to get bigger shoulders", "how to get bigger arms"]

for topic in IMLTopics:
    search(topic)


# nonDistractingTopics = [mathsTopics, agileTopics, IMLTopics, progTopics]

# for topic in nonDistractingTopics:
#     for subtopic in topic:
#         search(subtopic)

# search("try not to laugh memes")
# search("try not to laugh impossible")
# search("brainrot memes")


try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    driver.quit()

chrome_options.add_experimental_option("detach", True)


# now just wait for a while and let the script do its thing

# i deleted that csv to start over
