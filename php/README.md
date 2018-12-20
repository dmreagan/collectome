# Getting Started with the Crate.IO PHP Sample App

## Get Source

```bash
git clone git@github.com:crate/crate-sample-apps.git
cd php
```

## Load Dependencies

Install the application dependencies with [Composer](https://getcomposer.org/).

```bash
composer install
```

For image upload, you will also need the `libcurl` library. The procedure for doing so will vary depending on your platform. On Ubuntu-like Linux distros, there is a package called `php-curl`.

## Run PHP app

Start a local web server to test the app

```bash
php -S localhost:8080
```

Open *[http://localhost:8080](http://localhost:8080)* in a web browser.
