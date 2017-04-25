#!/usr/bin/python2

import requests
import json
import time
import os

BASE_URL = "http://54.200.131.176"

AUTHOR = "dcampbell"
TOKEN = "xxdcampbell"

TITLE = "Elements Of Structural And Systematic Botany, For High Schools And Elementary College Courses"

chapters = []
new_chap = False
new_scrap = True

with open('textbook.txt', 'r') as book:
    book_text = book.read()

for line in book_text.splitlines():
    print "processing line", line
    if line.strip() == "":
        new_scrap = True
        continue
    if line.startswith("CHAPTER"):
        chapters.append({'scraps': []})
        new_chap = True
        continue
    if new_chap:
        print "named", line
        new_chap = False
        chapters[-1]['title'] = line
        continue
    if new_scrap:
        new_scrap = False
        chapters[-1]['scraps'].append(line)
        continue
    chapters[-1]['scraps'][-1] += line

print "done processing lines, creating new book!"

r = requests.post(BASE_URL + '/books/new',
                  headers={'Authorization': 'Token ' + TOKEN},
                  data={'author':'dcampbell', 'name': TITLE})

print "book done?"

BOOK = json.loads(r.text)
print BOOK
BOOK_ID = BOOK['uuid']
chapter_ids = []

for chapter in chapters:
    scraps = []
    print("Creating chapter: %s", chapter['title'])
    r = requests.post(BASE_URL + '/chapters/new',
                      headers={'Authorization': 'Token ' + TOKEN},
                      data={'author':'dcampbell', 'name': chapter['title']})
    chapter_ids.append(json.loads(r.text)['uuid'])

    for scrap in chapter['scraps']:
        print("Creating scrap...")
        r = requests.post(BASE_URL + '/scraps/new',
                          headers={'Authorization': 'Token ' + TOKEN},
                          data={'author':'dcampbell', 'text': scrap})
        print r.text
        print r.url
        scraps.append(json.loads(r.text)['uuid'])

    print("Updating chapter with scraps")
    r = requests.post(BASE_URL + '/chapters/' + AUTHOR + '/' + chapter_ids[-1],
                      headers={'Authorization': 'Token ' + TOKEN},
                      data=json.dumps({'scraps': [[AUTHOR, scrap, None] for scrap in scraps]}))

    print("here's what happened: %s", r.text)

    print('Sleeping two seconds :)')
    time.sleep(2)

print("Updating book with chapters")
print json.dumps({'chapters': [[AUTHOR, chapter, None] for chapter in chapter_ids]})
r = requests.post(BASE_URL + '/books/' + AUTHOR + '/' + BOOK_ID,
                  headers={'Authorization': 'Token ' + TOKEN},
                  data=json.dumps({'chapters': [[AUTHOR, chapter, None] for chapter in chapter_ids]}))

print("here's what happened: %s", r.text)
