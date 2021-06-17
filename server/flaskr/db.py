import psycopg2
import psycopg2.extras

conn = psycopg2.connect("dbname=hochet user=hochet password=hochet")

def getStores(page, amount):
  cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
  cur.execute("SELECT * FROM stores LIMIT %s OFFSET %s", (amount, page*amount))
  res = cur.fetchall()

  cur.execute("SELECT COUNT(*) FROM stores")
  amount = cur.fetchone()

  cur.close()
  return res, amount

def getStore(sid):
  cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
  cur.execute("SELECT * FROM stores WHERE id = %s", (sid,))
  res = cur.fetchone()
  cur.close()
  return res

def getStarsDistribution(sid):
  cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
  cur.execute("SELECT stars, count(stars) FROM reviews WHERE storeid = %s GROUP BY stars", (sid,))
  stars = cur.fetchall()
  cur.execute("""
    SELECT a.cs AS stars, count(*) FROM (
      SELECT round(computed_stars) AS cs
      FROM reviews WHERE storeid = %s
    ) a
    GROUP BY a.cs
  """, (sid,))
  computed_stars = cur.fetchall()
  cur.close()
  return stars, computed_stars

def getStoreProductCategories(sid):
  cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
  cur.execute("SELECT DISTINCT a.category, a.level FROM public.products_extended, unnest(categories) WITH ORDINALITY a(category, level) WHERE storeid = %s ORDER BY a.level ASC", (sid,))
  return cur.fetchall()

def getCategoriesProducts(sid, categories, page, amount):
  cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
  if len(categories) == 0:
    cur.execute("SELECT * FROM public.products_extended WHERE storeid = %s LIMIT %s OFFSET %s", (sid, amount, page*amount))
  else:
    mapped_cats = ",".join(list(map(lambda it: "'{}'".format(it), categories)))
    cur.execute("SELECT * FROM public.products_extended WHERE storeid = %s AND ARRAY[{}] && categories LIMIT %s OFFSET %s".format(mapped_cats), (sid, amount, page*amount))
  return cur.fetchall()

def getAuthors(page, amount):
  cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
  cur.execute("SELECT author_id, COUNT(*) AS nb_reviews, AVG(computed_stars) AS avg_computed_stars, AVG(stars) AS avg_stars FROM updated_reviews GROUP BY author_id ORDER BY nb_reviews DESC LIMIT %s OFFSET %s", (amount, page*amount))
  res = cur.fetchall()

  cur.execute("SELECT COUNT(DISTINCT author_id) FROM updated_reviews")
  amount = cur.fetchone()
  cur.close()
  return res, amount

def getAuthor(authorid):
  cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
  cur.execute("SELECT author_id, author, author_img, author_link FROM updated_reviews WHERE author_id = %s", (authorid, ))
  res = cur.fetchone()
  cur.close()
  return res

def getAuthorStarsDistribution(aid):
  cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
  cur.execute("SELECT stars, COUNT(stars) FROM updated_reviews WHERE author_id = %s GROUP BY stars", (aid,))
  stars = cur.fetchall()
  cur.execute("""
    SELECT a.cs AS stars, count(*) FROM (
      SELECT round(computed_stars) AS cs
      FROM updated_reviews WHERE author_id = %s
    ) a
GROUP BY a.cs
  """, (aid,))
  computed_stars = cur.fetchall()
  cur.close()
  return stars, computed_stars

def getAuthorStoreDistribution(aid):
  cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
  cur.execute("""
SELECT r.storeid, s.storename, COUNT(r.*)
FROM updated_reviews r
INNER JOIN stores s ON s.storeid = r.storeid
WHERE author_id = %s
GROUP BY r.storeid, s.storename
ORDER BY count DESC""", (aid,))
  res = cur.fetchall()
  cur.close()
  return res

def getAuthorReviews(aid):
  cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
  cur.execute("select r.id, r.title, r.content, r.storeid, s.storename from updated_reviews r inner join stores s on s.storeid = r.storeid WHERE author_id = %s", (aid, ))
  res = cur.fetchall()
  cur.close()
  return res

def getStoreAuthors(sid, amount, page):
  cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
  cur.execute("""
    SELECT author_id, author, COUNT(*) AS nb_reviews, array_agg(productid) as product_ids FROM updated_reviews
    WHERE storeid = %s
    GROUP BY author_id, author
    ORDER BY nb_reviews DESC
    LIMIT %s
    OFFSET %s
  """, (sid, amount, page*amount))
  res = cur.fetchall()

  cur.execute("SELECT COUNT(DISTINCT author_id) FROM updated_reviews WHERE storeid = %s", (sid,))
  amount = cur.fetchone()

  cur.close()
  return res, amount

def search(term):
  term = term.replace('=', '==').replace('%', '=%').replace('_', '=_').lower()
  cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
  cur.execute("""
  SELECT author_id, author, COUNT(*) AS nb_reviews, array_agg(productid) as product_ids
  FROM updated_reviews
  WHERE LOWER(title) LIKE %(like)s ESCAPE '=' OR LOWER(content) LIKE %(like)s ESCAPE '='
  GROUP BY author_id, author
  LIMIT 5
  """, dict(like='%' + term + '%'))

  authors = cur.fetchall()

  cur.execute("""
  SELECT id, storeid, storename, nb_saved_articles, number_of_ratings, number_of_saved_reviews, product_global_review_avg, stars_avg, computed_stars_avg
  FROM stores
  WHERE LOWER(storename) LIKE %(like)s ESCAPE '='
  LIMIT 5
  """, dict(like='%' + term + '%'))

  stores = cur.fetchall()
  cur.close()

  return authors, stores

