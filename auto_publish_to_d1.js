/**
 * Google Apps Script / 자동화 브릿지: Google Drive -> Cloudflare D1 자동 배포
 * 
 * [동작 원리]
 * 1. 이 대화방에서 포스팅 SQL/원고를 구글 드라이브(11 퇴기사)에 저장
 * 2. 본 스크립트가 트리거(또는 시간 주기)로 새 파일을 감지하여 Cloudflare D1 REST API로 즉시 쿼리 전송 및 발행
 */

const CONFIG = {
  CF_ACCOUNT_ID: "YOUR_CLOUDFLARE_ACCOUNT_ID",       // Cloudflare 대시보드의 Account ID
  CF_DATABASE_ID: "YOUR_CLOUDFLARE_D1_DATABASE_ID",   // D1 데이터베이스 ID
  CF_API_TOKEN: "YOUR_CLOUDFLARE_API_TOKEN",         // D1 편집 권한을 가진 Cloudflare API Token
  TARGET_FOLDER_ID: "1egDt94yWlG_RdqGpJYUaKzPTNVuIvrT8" // 구글 드라이브 '11 퇴기사' 폴더 ID
};

function autoPublishD1() {
  const folder = DriveApp.getFolderById(CONFIG.TARGET_FOLDER_ID);
  const files = folder.getFilesByName("insert_health_post_d1.sql");
  
  if (!files.hasNext()) {
    Logger.log("발행할 SQL 파일이 없습니다.");
    return;
  }
  
  const file = files.next();
  const sqlQuery = file.getBlob().getDataAsString();
  
  const url = `https://api.cloudflare.com/client/v4/accounts/${CONFIG.CF_ACCOUNT_ID}/d1/database/${CONFIG.CF_DATABASE_ID}/query`;
  
  const payload = {
    sql: sqlQuery
  };
  
  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": `Bearer ${CONFIG.CF_API_TOKEN}`
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.success) {
      Logger.log("Cloudflare D1 자동 배포 성공: " + JSON.stringify(result));
    } else {
      Logger.log("Cloudflare D1 배포 실패: " + JSON.stringify(result.errors));
    }
  } catch (error) {
    Logger.log("통신 에러 발생: " + error.toString());
  }
}
