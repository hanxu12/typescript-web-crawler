import fs from "fs";
import path from "path";

import { Router, Request, Response, NextFunction } from "express";
import Crawler from "./utils/crawler";
import Analyzer from "./utils/analyzer";
import { getResponseData } from "./utils/util";

interface BodyRequest extends Request {
  body: { [key: string]: string | undefined };
}

const checkLogin = (req: Request, res: Response, next: NextFunction) => {
  const isLogin = req.session ? req.session.login : false;
  if (isLogin) {
    next();
  } else {
    res.json(getResponseData(null, "请先登录"));
  }
};

const router = Router();
router.get("/", (req: BodyRequest, res: Response) => {
  const isLogin = req.session ? req.session.login : undefined;
  if (isLogin) {
    res.send(`
      <html>
        <body>
        <a href = '/getData'>爬取内容</a>        
        <a href = '/showData'>展示内容</a>
        <a href = '/logout'>退出</a>
        </body>
      </html>
    `);
  } else {
    res.send(`
    <html>
      <body>
        <form method="post" action="/login">
          <input type="password" name="password" />
          <button>登录</button>
        </form>
      </body>
    </html>
    `);
  }
});

router.get("/getData", checkLogin, (req: BodyRequest, res: Response) => {
  const secret = "x3b174jsx";
  const url = `http://www.dell-lee.com/typescript/demo.html?secret=${secret}`;
  const analyzer = Analyzer.getInstance();
  new Crawler(url, analyzer);
  res.json(getResponseData(true));
});

router.get("/showData", checkLogin, (req: BodyRequest, res: Response) => {
  try {
    const position = path.resolve(__dirname, "../data/course.json");
    const result = fs.readFileSync(position, "utf8");
    res.json(getResponseData(JSON.parse(result)));
  } catch (e) {
    res.json(getResponseData(false, "数据不存在"));
  }
});

router.get("/logout", (req: BodyRequest, res: Response) => {
  if (req.session) {
    req.session.login = undefined;
  }
  res.json(getResponseData(true));
});

router.post("/login", (req: BodyRequest, res: Response) => {
  const { password, sdadsf } = req.body;
  const isLogin = req.session ? req.session.login : undefined;
  if (isLogin) {
    res.json(getResponseData(false, "已经登录过"));
  } else {
    if (password === "123" && req.session) {
      req.session.login = true;
      res.json(getResponseData(true));
    } else {
      res.json(getResponseData(false, "登录失败"));
    }
  }
});
export default router;
