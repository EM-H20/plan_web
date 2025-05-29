const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 5001;

// CORS 허용
app.use(cors());

// POST JSON 파싱
app.use(express.json());

app.get('/api/search', async (req, res) => {
  const { query } = req.query;

  try {
    const response = await axios.get('https://openapi.naver.com/v1/search/local.json', {
      params: {
        query: query,
        display: 1
      },
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
      }
    });

    const items = response.data.items.map(item => {
      const lat = parseFloat(item.mapy) / 1e7;
      const lng = parseFloat(item.mapx) / 1e7;

      return {
        name: item.title.replace(/<[^>]+>/g, ''),
        address: item.roadAddress,
        lat,
        lng
      };
    });

    res.json(items);
  } catch (error) {
    console.error('네이버 API 에러:', error);
    res.status(500).json({ error: '네이버 API로 검색 실패', detail: error.message });
  }
});

const categories = [ // 카카오맵에 존재하는 모든 카테고리들
  'MT1', // 대형마트
  'CS2', // 편의점
  'PS3', // 어린이집, 유치원
  'SC4', // 학교
  'AC5', // 학원
  'PK6', // 주차장
  'OL7', // 주유소, 충전소
  'SW8', // 지하철역
  'BK9', // 은행
  'CT1', // 문화시설
  'AG2', // 중개업소
  'PO3', // 공공기관
  'AT4', // 관광명소
  'AD5', // 숙박
  'FD6', // 음식점
  'CE7', // 카페
  'HP8', // 병원
  'PM9'  // 약국
];

const queries = [ // 위에 있는 카테고리에 속하지 않는 장소들
  '대학',
  '교회',
]

/** 
 * 위의 카테고리별로 1개씩 장소 검색.
 * 장소명으로는 10개씩 검색
 * 나온 모든 주소 합쳐서 return
 */
app.get('/api/poi', async (req, res) => {
  const { lat, lng } = req.query;

  try {
    let requests = categories.map(code => 
      axios.get('https://dapi.kakao.com/v2/local/search/category.json', {
        params: {
          x: lng,
          y: lat,
          radius: 200,
          sort: 'distance',
          size: 1,
          category_group_code: code
        },
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
        }
      })
    );

    requests = requests.concat(
      queries.map(query => 
        axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
          params: {
            query: query,
            x: lng,
            y: lat,
            radius: 200,
            sort: 'distance',
            size: 10,
          },
          headers: {
            Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
          }
        })
      )
    );

    const results = await Promise.all(requests);
    const merged = results.flatMap(r => r.data.documents);

    // 중복 제거 (place_id 기준)
    const uniquePlaces = Object.values(
      merged.reduce((acc, cur) => {
        acc[cur.id] = acc[cur.id] || cur;
        return acc;
      }, {})
    );

    res.json({ documents: uniquePlaces });
  } catch (error) {
    console.error('Kakao API 실패:', error);
    res.status(500).json({ error: 'Kakao API 사용 실패', detail: error.message });
  }
});

app.get('/api/route', async (req, res) => {
  const { start, goal } = req.query;
  try {
    const response = await axios.get('https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving', {
      params: { start, goal },
      headers: {
        'X-NCP-APIGW-API-KEY-ID': process.env.NCP_CLIENT_ID,
        'X-NCP-APIGW-API-KEY': process.env.NCP_CLIENT_SECRET
      }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: '경로 검색 실패', detail: err.message });
  }
});

app.listen(port, () => console.log(`http://localhost:${port} 로 서버 배포중`));