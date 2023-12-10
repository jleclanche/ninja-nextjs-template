# NextJS + Django with Django Ninja

This project is an example template on how to organize a NextJS project using a Django backend, with django-ninja as the API driver.

## Philosophy

React with Typescript is a wonderful environment to develop frontend with. NextJS is a very popular framework to combine the two without developing your own brittle stack. NextJS maintains that stack really well.

Django with Postgres is a well-known, robust way of writing backend models. The ORM is great to work with.

Using NextJS, you no longer need to work with Django's more brittle components such as forms and templates. The stack presented here offers a way of marrying the best from both worlds.

Known drawbacks:

-   Django is mostly untyped. This makes the experience sub-par, especially when using the ORM.
-   NextJS moves very fast, and you may want to keep an eye on its development to keep up to date.

## How it works

The `backend/` directory contains the Django project. The `frontend/` directory contains the NextJS project.
I recommend developing both in two separate git repositories. Do not try to mix the two.

Each project can be deployed individually. For example, the Django backend can be deployed to [Fly](https://fly.io/), whereas the Frontend can be deployed to [Vercel](https://vercel.com/).

Decoupling the two allows asynchronous development of the backend and frontend (separate developers/teams on the two sides). In general, fixing a typo or some style issues in the frontend should not require triggering backend test suites.

### Backend

The backend exposes an API driven by Django Ninja. Django Ninja is inspired by the wonderful [FastAPI](https://fastapi.tiangolo.com/), which internally uses [Pydantic](https://pydantic.dev/) and is itself inspired by [Flask](https://flask.palletsprojects.com/).

Ninja and Pydantic make extensive use of the Python typing system, building directly on top of it. This makes the development experience nicer and more predictable. Ninja also assumes you want to develop a REST API, and makes this the first-class experience (instead of starting from "you want to spit out HTML templates" as the primitive).

If you're familiar with Django REST Framework instead, you will notice a much leaner development experience. Ninja does not let you write subclassed views; instead, most of your functionality will be schema-driven (this makes them self-documenting with OpenAPI support), and your views may sometimes contain extra logic on a case-by-case basis. A lot easier to reason about, and test.

### Frontend

The frontend is as close as possible to a vanilla NextJS app. On top of it is an API client in the `src/api/` directory.

There are two API clients: A client-side API client and a server-side one. The client-side API client is generally used when the user is on a page, triggering things such as POSTs, PATCHs and DELETEs.
The server-side client is used for NextJS's SSR. For example, when NextJS needs to fetch a list of items from the Django API to render them in React, _before_ sending over the list to the end user.

**IMPORTANT**: It's critical to understand the difference between the four layers of your app in order to learn how to best optimize it:

1. The Postgres layer (database-level operations)
2. The Django layer (ORM & API, in a Python process)
3. The NextJS SSR (The server-side NodeJS process and how it communicates with Django)
4. The NextJS CSR (The end-user, in-browser JS process, and how it communicates with your API)

It's also best to understand that while NextJS tries very hard to "abstract" layers 3 and 4, they are still very much separate.

## References

-   [About NextJS](https://nextjs.org)
-   [About Django](https://djangoproject.com)
-   [About Django Ninja](https://django-ninja.dev)

## Author & License

Jerome Leclanche <jerome@leclan.ch>
This work is released in the public domain, or under a CC0 license if otherwise not possible.
https://creativecommons.org/public-domain/cc0/
