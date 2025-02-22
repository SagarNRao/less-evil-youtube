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

website = 'https://www.youtube.com'
path = 'C:/Users/username/Downloads/chromedriver_win32/chromedriver.exe'
driver = webdriver.Chrome(options=chrome_options)

driver.get(website)

search_box = driver.find_element(
    "xpath", '/html/body/ytd-app/div[1]/div[2]/ytd-masthead/div[4]/div[2]/yt-searchbox/div[1]/form/input')
search_box.click()

df = pd.DataFrame(columns=["id", "title", "description",
                  'topic_categories' "thumbnail", "tags", "distracting"])


def search(query):
    global df
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
                'topic_categories': "['Maths', 'Education']",
                "category": 22,
                "thumbnail": "",
                "tags": "",
                "distracting": 0
            }])

            # Concatenate the new row with the existing DataFrame
            df = pd.concat([df, new_row], ignore_index=True)

            print("-------------------")
            df.to_csv('scraped_videos2.csv', index=False)
            
            search_box.send_keys(Keys.CONTROL, "a")
            search_box.send_keys(Keys.DELETE)

        except Exception as e:
            print(f"Error extracting video data: {e}")
            continue


search("calculus")
# search("discord memes")

print(df)


try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    driver.quit()

chrome_options.add_experimental_option("detach", True)


# now just wait for a while and let the script do its thing

# i deleted that csv to start over 