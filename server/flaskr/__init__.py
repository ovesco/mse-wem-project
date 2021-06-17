from flask import Flask, request, jsonify
from flask_cors import CORS
import json

import flaskr.db as db

def create_app():
  app = Flask(__name__, instance_relative_config=True)

  CORS(app)


  @app.route("/stores")
  def stores():
    amount = request.args.get("amount", 10, type=int)
    page = request.args.get("page", 0, type=int)
    content, amount = db.getStores(page, amount)
    return jsonify({
      "total": amount['count'],
      "stores": content
    })

  @app.route("/store")
  def store():
    sid = request.args.get("id")
    return jsonify(db.getStore(sid))

  @app.route("/store-stars-distribution")
  def stars_distribution():
    storeid = request.args.get("storeid")
    stars, cp_stars = db.getStarsDistribution(storeid)
    return jsonify({
      "stars": stars,
      "computed_stars": cp_stars
    })

  @app.route("/store-products-categories")
  def store_products_categories():
    storeid = request.args.get("storeid")
    return jsonify(db.getStoreProductCategories(storeid))

  @app.route("/categories-products", methods=['POST'])
  def categories_products():
    storeid = request.args.get("storeid")
    amount = request.args.get("amount", 10, type=int)
    page = request.args.get("page", 0, type=int)
    data = json.loads(request.data)
    return jsonify(db.getCategoriesProducts(storeid, data['categories'], page, amount))

  @app.route("/authors")
  def authors():
    amount = request.args.get("amount", 10, type=int)
    page = request.args.get("page", 0, type=int)
    res, amount = db.getAuthors( page, amount)
    return jsonify({
      "total": amount['count'],
      "authors": res
    })


  @app.route("/author")
  def author():
    authorid = request.args.get('authorid')
    return jsonify(db.getAuthor(authorid))

  @app.route("/author-stars-distribution")
  def author_stars_distribution():   
    authorid = request.args.get('authorid')
    stars, cp_stars = db.getAuthorStarsDistribution(authorid)
    return jsonify({
      "stars": stars,
      "computed_stars": cp_stars
    })

  @app.route("/author-store-distribution")
  def author_store_distribution():
    return jsonify(db.getAuthorStoreDistribution(request.args.get('authorid')))

  @app.route("/author-reviews")
  def author_reviews():
    return jsonify(db.getAuthorReviews(request.args.get('authorid')))

  @app.route("/store-authors")
  def store_authors():
    amount = request.args.get("amount", 10, type=int)
    page = request.args.get("page", 0, type=int)
    authors, amount = db.getStoreAuthors(request.args.get('storeid'), amount, page)
    return jsonify({
      "authors": authors,
      "count": amount
    })

  @app.route("/search", methods=['POST'])
  def search():
    term = request.data.decode("utf-8") 
    authors, stores = db.search(term)
    return jsonify({
      "authors": authors,
      "stores": stores
    })

  return app

