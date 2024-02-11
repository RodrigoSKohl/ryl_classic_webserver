// models/dbFunctions.js

// Função para verificar se o username já existe no banco de dados
async function checkExistingUser(username, pool, mssql, dbTable) {
    const result = await pool.request()
      .input('username', mssql.VarChar(12), username)
      .query(`
        SELECT TOP 1 1
        FROM ${dbTable}
        WHERE account = @username
      `);
  
    return result.recordset.length > 0;
  }
  
  // Função para verificar se o email já existe no banco de dados
  async function checkExistingEmail(email, pool, mssql, dbTable) {
    const result = await pool.request()
      .input('email', mssql.VarChar(50), email)
      .query(`
        SELECT TOP 1 1
        FROM ${dbTable}
        WHERE email = @email
      `);
  
    return result.recordset.length > 0;
  }
  
  module.exports = {
    checkExistingUser,
    checkExistingEmail,
  };