const { By, Key, Builder, until, Select } = require('selenium-webdriver');
const mongoose = require('mongoose');
const assert = require('assert');
const User = require('../models/User');
const config = require('config');
const db = config.get('mongoURI');
const baseURL = config.get('baseURL');
const getDriver = async () => {
  let driver = await new Builder().forBrowser('chrome').build();
  return driver;
};

const emailAddress = 'test@gmail.com';
const password = 'test123456';


// Signup
describe('Register', function () {
  // connectDB();
  let driver;
  this.timeout(60000);
  before(async function () {
    try {
      // driver = await new Builder().forBrowser('chrome').build();
      driver = await new Builder()
      .usingServer('http://selenium-hub:4444/') 
      .forBrowser('chrome')
      .build();
    } catch (error) {
      console.error('An error occurred:', error);
    }
  });
  after(async function () {
    try {
      // await User.findOneAndRemove({ email: emailAddress }).exec();
      // await mongoose.connection.close();

      await driver.quit();
    } catch (error) {
      console.error('An error occurred:', error);
    }
  });


  it('Register', async function () {
    await driver.get(`${baseURL}/register`);
    console.log(`${baseURL}/register`);
    await driver.findElement(By.name('name')).sendKeys('Test User');
    await driver.findElement(By.name('email')).sendKeys(emailAddress);
    await driver.findElement(By.name('password')).sendKeys(password);
    await driver.findElement(By.name('password2')).sendKeys(password);

    await driver
      .findElement(By.xpath('//*[@id="root"]/section/form/input'))
      .click();
    // Wait till page load
    await driver.sleep(1000);
    let txt = await driver.wait(
      until.elementLocated(By.xpath('//*[@id="root"]/section/h1')),
      4000
    );
    txt = await txt.getText();
    await driver
      .findElement(By.xpath('//*[@id="root"]/nav/ul/li[4]/a'))
      .click();

    assert.strictEqual(txt, 'Dashboard');
  });

  it('Login', async function () {
    await driver.get(`${baseURL}/login`);
    await driver.findElement(By.name('email')).sendKeys(emailAddress);
    await driver.findElement(By.name('password')).sendKeys(password);
    await driver
      .findElement(By.xpath('//*[@id="root"]/section/form/input'))
      .click();
    // Wait till page load
    await driver.sleep(1000);
    let txt = await driver.wait(
      until.elementLocated(By.xpath('//*[@id="root"]/section/h1')),
      4000
    );
    txt = await txt.getText();
    assert.strictEqual(txt, 'Dashboard');
  });

  // Create Profile
  it('Create Profile', async function () {
    await driver.get(`${baseURL}/create-profile`);

    const selectElement = driver.findElement(By.name('status'));

    const select = new Select(selectElement);
    select.selectByValue('Developer');

    await driver.findElement(By.name('company')).sendKeys('Test Company');
    await driver.findElement(By.name('website')).sendKeys('http://google.com/');
    await driver
      .findElement(By.name('location'))
      .sendKeys('Islamabad, Pakistan');
    await driver
      .findElement(By.name('skills'))
      .sendKeys('JS,NODE,REACT, HTML, CSS');
    await driver.findElement(By.name('githubusername')).sendKeys('google');

    await driver
      .findElement(By.xpath('//*[@id="root"]/section/form/input'))
      .click();

    await driver.sleep(1000);

    // Check Button Text by Xpath
    let txt = await driver.wait(
      until.elementLocated(By.xpath('//*[@id="root"]/section/div[1]/a[1]')),
      4000
    );
    txt = await txt.getText();
    assert.strictEqual(txt, 'Edit Profile');
  });

  // Add Portfoliio

  it('Add Portfolio', async function () {
    await driver.get(`${baseURL}/add-portfolio`);
    await driver.findElement(By.name('title')).sendKeys('Test Portfolio');
    await driver.findElement(By.name('link')).sendKeys('http://facebook.com/');

    // Click on Add Portfolio Button
    await driver
      .findElement(By.xpath('/html/body/div/section/form/input'))
      .click();

    await driver.sleep(1000);

    const tableBody = await driver.findElement(
      By.xpath('/html/body/div/section/table[3]/tbody')
    );

    // Find all <tr> elements within the table body
    const rows = await tableBody.findElements(By.tagName('tr'));

    let found = false;

    // Iterate over the rows
    for (let row of rows) {
      // Find the first <td> element within the row
      const firstCell = await row.findElement(By.xpath('.//td[1]'));

      // Get the text of the first cell
      const firstCellText = await firstCell.getText();

      // Check if the value of the first cell matches 'Test Portfolio'
      if (firstCellText === 'Test Portfolio') {
        found = true;
        break;
      }
    }

    if (found) {
      assert.strictEqual(found, true);
    } else {
      assert.strictEqual(found, false);
    }
  });

  // Delete Profile
  it('Delete Profile', async function () {
    await driver.get(`${baseURL}/dashboard`);
    await driver.sleep(1000);
    await driver
      .findElement(By.xpath('/html/body/div/section/div[2]/button'))
      .click();

    const alert = await driver.switchTo().alert();

    await alert.accept();

    await driver.sleep(1000);

    let txt = await driver.wait(
      until.elementLocated(By.xpath('/html/body/div/section/h1')),
      4000
    );
    txt = await txt.getText();
    assert.strictEqual(txt, 'Sign In');
  });
});