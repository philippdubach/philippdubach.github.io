---
title: "How to Install YOURLS: Free Self-Hosted URL Shortener on Azure, AWS, Oracle (Ubuntu 22.04)"

images: ['https://static.philippdubach.com/ograph/ograph-post.jpg']
slug: yourls-azure-tutorial
description: "Complete step-by-step guide to install and configure YOURLS (Your Own URL Shortener) on Azure, AWS, or Oracle Cloud using Ubuntu 22.04. Learn how to set up a free self-hosted URL shortener with Apache, MySQL, and SSL certificates."
keywords: ["YOURLS", "URL shortener", "self-hosted URL shortener", "Azure tutorial", "AWS tutorial", "Oracle Cloud", "Ubuntu 22.04", "YOURLS installation", "free URL shortener", "self-hosted", "Apache MySQL PHP", "Let's Encrypt SSL", "cloud hosting", "VM setup", "URL shortening service", "YOURLS configuration", "web server setup", "database configuration"]
draft: false
---

If you're tired of relying on third-party URL shorteners or just always wanted to host your own link shortener like me, [YOURLS](https://yourls.org) is a solid choice. It's a self-hosted PHP application that gives you your own URL shortening service, complete with analytics and custom short links.

The setup is straightforward. You'll need a VM instance, a domain name pointing to it, and an SSL certificate. Most cloud providers offer free tier VMs that work perfectly for this. I went with Azure for this guide, but the steps are nearly identical for AWS or Oracle Cloud. Compare free tier options on the [Cloud Free Tier Comparison List](https://github.com/cloudcommunity/Cloud-Free-Tier-Comparison?tab=readme-ov-file#1-aws) to see what fits your needs.

<details>
    <summary>Prerequisites</summary>
    - A VM instance (Azure, AWS, Oracle Cloud, etc.)<br>
	- A domain name configured to point to your server<br>
	- SSL certificate (preferably)
</details>
<br>

## Step 1: Setting Up Your Azure Instance

### Create a Virtual Machine

1. Log into the [Azure Portal](https://portal.azure.com) and navigate to "Virtual Machines"
2. Click "Create" → "Azure virtual machine"

{{< img src="azure-tutorial-screen1.jpg" alt="alt" width="80%" >}}


3. Fill in the basic details:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new or use existing
   - **Virtual machine name**: Choose a name (e.g., `yourls-server`)
   - **Region**: Choose a region close to you
   - **Image**: Select "Ubuntu Server 22.04 LTS"
   - **Size**: For the free tier, select "Standard_B1s" (1 vCPU, 1 GiB RAM)

{{< img src="azure-tutorial-screen2.jpg" alt="alt" width="80%" >}}

4. Under "Administrator account":
   - **Authentication type**: SSH public key (recommended) or Password
   - **Username**: Choose a username (e.g., `azureuser`)
   - **SSH public key source**: Generate new key pair or use existing


5. Under "Inbound port rules":
   - **Public inbound ports**: Allow selected ports
   - **Select inbound ports**: SSH (22), HTTP (80), HTTPS (443)

{{< img src="azure-tutorial-screen3.jpg" alt="alt" width="80%" >}}

6. Review and create the VM. This may take a few minutes.

### Connect to Your Server

Once your VM is created, you can connect via SSH:

```bash
ssh azureuser@YOUR_VM_PUBLIC_IP
```

Replace `YOUR_VM_PUBLIC_IP` with the public IP address shown in the Azure portal.


### Update System Packages

Once connected, update your system:

```bash
sudo apt update && sudo apt upgrade -y
```

Now that your server is ready, let's get the web stack installed. YOURLS needs Apache, MySQL, and PHP to run properly.

## Step 2: Install Required Software

Install Apache, MySQL/MariaDB, and PHP:

### Install Apache

```bash
sudo apt install apache2 -y
sudo systemctl enable apache2
sudo systemctl start apache2
```

### Install MySQL

```bash
sudo apt install mysql-server -y
sudo systemctl enable mysql
sudo systemctl start mysql
```

Secure your MySQL installation:

```bash
sudo mysql_secure_installation
```

Follow the prompts to set a root password and configure security settings.

### Install PHP and Required Extensions

```bash
sudo apt install php php-mysql php-curl php-mbstring php-xml php-gd php-zip -y
```

Verify PHP installation:

```bash
php -v
```

You should see PHP 8.1 or later.

With all the software installed, we need to enable a few Apache modules that YOURLS depends on for URL rewriting and SSL.

## Step 3: Configure Apache Modules

Enable the required Apache modules for YOURLS:

```bash
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers
sudo systemctl restart apache2
```

### Verify Services

Check that all services are running:

```bash
# Check Apache status
sudo systemctl status apache2

# Check MySQL status
sudo systemctl status mysql
```

Everything should be running smoothly now. Time to grab the YOURLS files and get them set up on your server.

## Step 4: Download YOURLS

Download the latest YOURLS release:

```bash
cd ~
wget https://github.com/YOURLS/YOURLS/archive/1.10.2.tar.gz -O yourls-1.10.2.tar.gz
tar -xzf yourls-1.10.2.tar.gz
```

## Step 5: Set Up Web Directory

Create a directory for your domain and copy YOURLS files:

```bash
# Create web directory for your domain
sudo mkdir -p /var/www/yourdomain.com

# Copy YOURLS files to web directory
sudo cp -r ~/YOURLS-1.10.2/* /var/www/yourdomain.com/

# Ensure user directory exists
sudo mkdir -p /var/www/yourdomain.com/user
```

Before we configure YOURLS, we need to set up the database. YOURLS stores all your links and stats in MySQL, so let's create a dedicated database and user for it.

## Step 6: Create MySQL Database and User

### Generate Secure Password

```bash
# Generate a secure random password
DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "DB_PASS=$DB_PASS" > /tmp/yourls_db_pass.txt
```

**Important**: Save this password securely - you'll need it for the configuration file.

### Create Database and User

```bash
# Read the password
DB_PASS=$(cat /tmp/yourls_db_pass.txt | cut -d= -f2)

# Create database and user
sudo mysql -e "CREATE DATABASE IF NOT EXISTS yourls_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'yourls_user'@'localhost' IDENTIFIED BY '$DB_PASS';"
sudo mysql -e "GRANT ALL PRIVILEGES ON yourls_db.* TO 'yourls_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

## Step 7: Generate Security Keys

Generate a cookie encryption key and an admin password:

### Generate Cookie Key

```bash
COOKIE_KEY=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)
echo "COOKIE_KEY=$COOKIE_KEY"
```

### Generate Admin Password

```bash
ADMIN_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "ADMIN_PASS=$ADMIN_PASS"
```

**Important**: Save both the cookie key and admin password securely. You'll need them to log into the admin panel.

Now create the configuration file that tells YOURLS how to connect to the database.

## Step 8: Create Configuration File

```bash
sudo nano /var/www/yourdomain.com/user/config.php
```

Or create it directly with a here-document:

```bash
sudo tee /var/www/yourdomain.com/user/config.php > /dev/null << 'EOFCONFIG'
<?php
/*
 ** MySQL settings - You can get this info from your web host
 */

/** MySQL database username */
define( 'YOURLS_DB_USER', 'yourls_user' );

/** MySQL database password */
define( 'YOURLS_DB_PASS', 'YOUR_DB_PASSWORD_HERE' );

/** The name of the database for YOURLS */
define( 'YOURLS_DB_NAME', 'yourls_db' );

/** MySQL hostname. */
define( 'YOURLS_DB_HOST', 'localhost' );

/** MySQL tables prefix */
define( 'YOURLS_DB_PREFIX', 'yourls_' );

/*
 ** Site options
 */

/** YOURLS installation URL */
define( 'YOURLS_SITE', 'https://yourdomain.com' );

/** YOURLS language */
define( 'YOURLS_LANG', '' );

/** Allow multiple short URLs for a same long URL */
define( 'YOURLS_UNIQUE_URLS', true );

/** Private means the Admin area will be protected with login/pass */
define( 'YOURLS_PRIVATE', true );

/** A random secret hash used to encrypt cookies */
define( 'YOURLS_COOKIEKEY', 'YOUR_COOKIE_KEY_HERE' );

/** Username(s) and password(s) allowed to access the site */
$yourls_user_passwords = [
	'admin' => 'YOUR_ADMIN_PASSWORD_HERE',
];

/** URL shortening method: either 36 or 62 */
define( 'YOURLS_URL_CONVERT', 36 );

/** Debug mode */
define( 'YOURLS_DEBUG', false );

/**
* Reserved keywords
*/
$yourls_reserved_URL = [
	'porn', 'faggot', 'sex', 'nigger', 'fuck', 'cunt', 'dick',
];
EOFCONFIG
```

Replace the placeholders with your actual values:

```bash
DB_PASS=$(cat /tmp/yourls_db_pass.txt | cut -d= -f2)
sudo sed -i "s|YOUR_DB_PASSWORD_HERE|$DB_PASS|" /var/www/yourdomain.com/user/config.php
sudo sed -i "s|YOUR_COOKIE_KEY_HERE|$COOKIE_KEY|" /var/www/yourdomain.com/user/config.php
sudo sed -i "s|YOUR_ADMIN_PASSWORD_HERE|$ADMIN_PASS|" /var/www/yourdomain.com/user/config.php
sudo sed -i "s|https://yourdomain.com|https://yourdomain.com|" /var/www/yourdomain.com/user/config.php
```

**Note**: Replace `yourdomain.com` with your actual domain name in the last command and in the config file.

## Step 9: Set File Permissions

```bash
# Set ownership to web server user
sudo chown -R www-data:www-data /var/www/yourdomain.com

# Set directory permissions
sudo chmod -R 755 /var/www/yourdomain.com

# Set config file permissions (readable but secure)
sudo chmod 644 /var/www/yourdomain.com/user/config.php

# Make plugins directory writable for future plugin installations
sudo chmod -R 775 /var/www/yourdomain.com/user/plugins
```

## Step 10: Create .htaccess File

```bash
sudo tee /var/www/yourdomain.com/.htaccess > /dev/null << 'EOFHTACCESS'
# BEGIN YOURLS
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^.*$ /yourls-loader.php [L]
</IfModule>
# END YOURLS
EOFHTACCESS

sudo chown www-data:www-data /var/www/yourdomain.com/.htaccess
sudo chmod 644 /var/www/yourdomain.com/.htaccess
```

Next up, we need to configure Apache to serve your domain. This involves setting up virtual hosts for both HTTP and HTTPS.

## Step 11: Configure Apache Virtual Host

### Create HTTP Virtual Host (Port 80)

```bash
sudo nano /etc/apache2/sites-available/yourdomain.com.conf
```

Add the following content:

```apache
<VirtualHost *:80>
    ServerAdmin webmaster@yourdomain.com
    ServerName yourdomain.com
    DocumentRoot /var/www/html

    # Redirect HTTP to HTTPS
    Redirect permanent / https://yourdomain.com/

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

### Create HTTPS Virtual Host (Port 443)

```bash
sudo nano /etc/apache2/sites-available/yourdomain.com-ssl.conf
```

Add the following content:

```apache
<VirtualHost *:443>
    ServerAdmin webmaster@yourdomain.com
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    # SSLCertificateChainFile /path/to/chain.pem  # If applicable

    DocumentRoot /var/www/yourdomain.com

    <Directory /var/www/yourdomain.com>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/yourdomain.com-error.log
    CustomLog ${APACHE_LOG_DIR}/yourdomain.com-access.log combined
</VirtualHost>
```

### Enable Sites

```bash
sudo a2ensite yourdomain.com.conf
sudo a2ensite yourdomain.com-ssl.conf
```

## Step 12: SSL Certificate Setup

You have two main options for SSL certificates:

### Option A: Using Let's Encrypt (Recommended - Free)

Let's Encrypt provides free SSL certificates with auto-renewal:

```bash
sudo apt install certbot python3-certbot-apache -y
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically configure Apache with SSL and set up auto-renewal.


### Option B: Using a Commercial SSL Certificate

If using a commercial SSL certificate from your domain registrar:

1. Upload your certificate files to the server
2. Update the SSL paths in `/etc/apache2/sites-available/yourdomain.com-ssl.conf`:
   - `SSLCertificateFile`: Path to your certificate file
   - `SSLCertificateKeyFile`: Path to your private key file
   - `SSLCertificateChainFile`: Path to your chain file (if provided)

Once SSL is configured, test Apache before pointing DNS to the server.

## Step 13: Test and Start Apache

```bash
# Test Apache configuration
sudo apache2ctl configtest
```

If the test passes:

```bash
# Restart Apache
sudo systemctl restart apache2

# Enable Apache to start on boot
sudo systemctl enable apache2

# Check status
sudo systemctl status apache2
```

Apache is configured and running. Point your domain to this server to access YOURLS.

## Step 14: Configure DNS

1. Log into your domain registrar's DNS management panel
2. Create an A record pointing your domain to your Azure VM's public IP address:
   - **Type**: A
   - **Name**: @ (or yourdomain.com)
   - **Value**: YOUR_VM_PUBLIC_IP
   - **TTL**: 3600 (or default)

3. Optionally, create a CNAME record for www:
   - **Type**: CNAME
   - **Name**: www
   - **Value**: yourdomain.com
   - **TTL**: 3600


DNS propagation can take anywhere from a few minutes to 48 hours, though it's usually much faster.

## Step 15: Verify Installation

Once DNS has propagated:

### Test Database Connection

```bash
DB_PASS=$(cat /tmp/yourls_db_pass.txt | cut -d= -f2)
mysql -u yourls_user -p"$DB_PASS" -h localhost yourls_db -e "SELECT 1;"
```

If this runs without errors, your database connection is working.

### Access Admin Panel

1. Open your browser and navigate to: `https://yourdomain.com/admin/`
2. You should see the YOURLS setup page

{{< img src="azure-tutorial-screen4.jpg" alt="alt" width="80%" >}}

3. Run the automatic installation

{{< img src="azure-tutorial-screen5.jpg" alt="alt" width="80%" >}}

4. Reload the page

5. Login with:
   - **Username**: `admin` (or whatever you set in config.php)
   - **Password**: The admin password you generated in Step 7

{{< img src="azure-tutorial-screen6.jpg" alt="alt" width="80%" >}}

### Test Creating a Short URL

Once logged in, create a short URL to verify everything works:

1. Enter a long URL in the "Enter a URL" field
2. Optionally, specify a custom keyword
3. Click "Shorten The URL"

{{< img src="azure-tutorial-screen7.jpg" alt="alt" width="80%" >}}


## Troubleshooting

### Apache Returns 403 Forbidden

- Check file permissions: `sudo chown -R www-data:www-data /var/www/yourdomain.com`
- Verify `AllowOverride All` is set in Apache config
- Check Apache error logs: `sudo tail -f /var/log/apache2/error.log`

### Database Connection Errors

- Verify database exists: `sudo mysql -e "SHOW DATABASES;"`
- Check user permissions: `sudo mysql -e "SHOW GRANTS FOR 'yourls_user'@'localhost';"`
- Verify password in config.php matches the database user password

### SSL Certificate Issues

- Ensure mod_ssl is enabled: `sudo a2enmod ssl`
- Check certificate paths are correct
- Verify certificate files are readable: `sudo ls -la /path/to/certificate`
- For Let's Encrypt, check renewal: `sudo certbot renew --dry-run`

### Short URLs Not Working

- Verify mod_rewrite is enabled: `sudo a2enmod rewrite`
- Check .htaccess file exists and has correct permissions
- Ensure `AllowOverride All` is set in Apache Directory directive
- Check Apache error logs for specific rewrite errors

### Can't Access Site After DNS Change

- Verify DNS propagation: `dig yourdomain.com` or use online DNS checkers
- Check that your firewall allows HTTP (80) and HTTPS (443) traffic
- Verify Apache is running: `sudo systemctl status apache2`
- Check that your virtual hosts are enabled: `sudo apache2ctl -S`

## Security Best Practices

1. **Keep credentials secure**: Store database passwords and admin credentials in a password manager
2. **Regular updates**: Keep YOURLS, PHP, Apache, and MySQL updated:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
3. **Backup regularly**: Set up automated backups for your database and config files
4. **File permissions**: Never make config.php world-writable (644 is sufficient)
5. **Firewall**: Configure Azure Network Security Groups to only allow necessary ports
6. **SSH security**: Consider disabling password authentication and using SSH keys only

## File Locations Summary

- **YOURLS Installation**: `/var/www/yourdomain.com/`
- **Configuration File**: `/var/www/yourdomain.com/user/config.php`
- **Apache Config (HTTP)**: `/etc/apache2/sites-available/yourdomain.com.conf`
- **Apache Config (HTTPS)**: `/etc/apache2/sites-available/yourdomain.com-ssl.conf`
- **.htaccess**: `/var/www/yourdomain.com/.htaccess`
- **Database**: `yourls_db` (MySQL)
- **Database User**: `yourls_user@localhost`

## Next Steps

Now that everything is working, here's what you can do next:

1. Log into the admin panel at `https://yourdomain.com/admin/`
2. Test creating a short URL
3. Customize your YOURLS installation with plugins from the [YOURLS plugin directory](https://yourls.org/pluginlist)
4. Set up regular backups (consider automating with cron jobs)
5. Monitor your installation for security updates
6. Configure analytics if desired
7. Set up email notifications for new short URLs (if using plugins)

## Conclusion

That's it. You've got your own URL shortener running. YOURLS is flexible once you start digging into plugins and customization. Since we're using free tier VMs, this setup costs nothing to run, perfect for personal projects or small teams.

Keep everything updated and set up backups. The last thing you want is losing all your links because you forgot to back up the database.

## References

- [YOURLS Official Website](https://yourls.org/)
- [YOURLS Documentation](https://yourls.org/docs)
- [YOURLS GitHub Repository](https://github.com/YOURLS/YOURLS)
- [Azure Free Tier Documentation](https://azure.microsoft.com/free/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)