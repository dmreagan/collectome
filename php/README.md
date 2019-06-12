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

For image upload, you will also need the `libcurl` library. The procedure for doing so will vary depending on your platform. On Ubuntu-like Linux distros, there is a package called `php-curl`. This library is also required for GitHub authentication.

## Create environment variables

For GitHub authentication, it is necessary to set two environment variables on your system. For development, you can create your own OAuth app in GitHub. For production, you will need to use the official values. You can set the environment variables in _.bashrc_ as follows:

```bash
export GITHUB_CLIENT_ID="myclientid"
export GITHUB_CLIENT_SECRET="myclientsecret"
```

## Run PHP app

Start a local web server to test the app

```bash
php -S localhost:8081
```

Open *[http://localhost:8081](http://localhost:8081)* in a web browser.
