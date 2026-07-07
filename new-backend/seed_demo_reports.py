"""
Seeds Supabase with a batch of realistic-looking user reports so you can
demo the monthly retraining pipeline on the spot instead of waiting a
month for real reports to accumulate.

Run this, then run retrain_model.py right after — that's the whole demo:

    python seed_demo_reports.py
    python retrain_model.py

Safe to re-run: it upserts on video_id, so running it twice just refreshes
the same demo rows instead of duplicating them.
"""


from supabase_helper import insert_report

# A small, hand-picked batch standing in for "a month's worth of reports".
# Titles/tags are written to look like real clickbait/distracting content
# so the retrained model has something meaningful to pick up on.
DEMO_REPORTS = [
    dict(
        video_id="bWHmYGw7qAc",
        title="Family Guy Called Me Out... LWIAY #00170",
        description="Insane reaction video, smash that like button and subscribe!!",
        tags=["reaction", "gone wrong", "prank", "viral"],
        topic_categories=["https://en.wikipedia.org/wiki/Entertainment"],
        channel_name="PewDiePie",
        channel_id="UClHJZR3Gqxm24VdAJ5Yw",
    ),
    dict(
        video_id="yNsIh0ciYiI",
        title="This show is PEAK Entertainment!",
        description="",
        tags=["vlog", "extreme"],
        topic_categories=["https://en.wikipedia.org/wiki/Entertainment"],
        channel_name="PewDiePie",
        channel_id="UClHJZR3Gqxm24VdAJ5Yw",
    ),
    dict(
        video_id="7n5U54WwG2c",
        title="IS THIS LIVE...? - YLYL #0032",
        description="""you cringe you lose, cringe compilation, news cringe, if you cringe, you lose this challenge. smash like for more cringe.

SUBMIT MEMES:   / pewdiepiesubmissions  
CHECK OUT: 

Check out A$$: http://store.steampowered.com/app/703...
(A game I helped make):""",
        tags=["top 10", "caught on camera"],
        topic_categories=["https://en.wikipedia.org/wiki/Entertainment"],
        channel_name="PewDiePie",
        channel_id="UClHJZR3Gqxm24VdAJ5Yw",
    ),
    dict(
        video_id="wwAJdHv8f1Y",
        title="""the entire "Thriller" album but only when Michael Jackson says "E"
 """,
        description="the lady in my life is missing because i couldn't cleanly isolate the vocals but otherwise here is the entire thriller album but only when michael jackson says E",
        tags=["music", "michael jackson", "funny"],
        topic_categories=["https://en.wikipedia.org/wiki/Entertainment"],
        channel_name="I don't like sand",
        channel_id="UC70OLKpOlS8PgkR5pSClNSQ",
    ),
    dict(
        video_id="XTSydJp_1nQ",
        title="SNL moments I quote to my cat when I'm drunk",
        description="""This is my first compilation, enjoy :)
And no, there is no such thing as too much Kate McKinnon

I do not own any of the clips in the video. All rights go to@SaturdayNightLive""",
        tags=["actress", "hollywood", "Entertainment", "comedy", "funny"],
        topic_categories=["https://en.wikipedia.org/wiki/Entertainment"],
        channel_name="mia roy",
        channel_id="UCNCdrM9cIsOydOI39RBgKgg",
    ),
    dict(
        video_id="ZgyU0LyWZ9M",
        title="You Can’t Con a Con Artist If You’re Also a Con Artist - Key & Peele",
        description=""""Two con artists attempt to out-con each other. About Key & Peele: Key & Peele showcases the fearless wit of stars Keegan-Michael Key and Jordan Peele as the duo takes on everything from “Gremlins 2” to systemic racism. With an array of sketches as wide-reaching as they are cringingly accurate, the pair has created a bevy of classic characters, including Wendell, the players of the East/West Bowl and President Obama’s Anger Translator. Subscribe to Key & Peele:    / @keyandpeele For more original comedy, check out  @comedycentraloriginals:    / @comedycentraloriginals""""",
        tags=["comedy", "funny", "acting"],
        topic_categories=[
            "https://en.wikipedia.org/wiki/Entertainment"],
        channel_name="Key and Peele",
        channel_id="UCdN4aXTrHAtfgbVG9HjBmxQ",
    ),
]


def main():
    for report in DEMO_REPORTS:
        insert_report(**report)
        print(f"Seeded report: {report['video_id']} — {report['title']}")
    print(f"\nDone. Seeded {len(DEMO_REPORTS)} demo report(s) into Supabase.")
    print("Now run `python retrain_model.py` to demo the batch retrain.")


if __name__ == "__main__":
    main()
