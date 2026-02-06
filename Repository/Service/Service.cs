using Investica.Models;
using Investica.Repository.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Net.NetworkInformation;
using System.Threading.Tasks;

namespace Investica.Repository
{
    public class Service : IService
    {
        private readonly string _conn;
        public Service(IConfiguration cfg)
        {
            _conn = cfg.GetConnectionString("ConnStringDb") ?? throw new InvalidOperationException("ConnStringDb missing");
        }

        private SqlConnection Conn() => new SqlConnection(_conn);

        #region RoleMaster
        public async Task<List<RoleMaster>> GetRolesAsync()
        {
            var list = new List<RoleMaster>();
            const string sql = @"SELECT Id, Name, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive FROM RoleMaster ORDER BY Name";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            await using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                list.Add(new RoleMaster
                {
                    Id = rdr.GetInt32(0),
                    Name = rdr.GetString(1),
                    CreatedDate = rdr.IsDBNull(2) ? null : rdr.GetDateTime(2),
                    CreatedBy = rdr.IsDBNull(3) ? null : (int?)rdr.GetInt32(3),
                    ModifiedDate = rdr.IsDBNull(4) ? null : rdr.GetDateTime(4),
                    ModifiedBy = rdr.IsDBNull(5) ? null : (int?)rdr.GetInt32(5),
                    IsActive = !rdr.IsDBNull(6) && rdr.GetBoolean(6)
                });
            }
            return list;
        }

        public async Task<RoleMaster?> GetRoleByIdAsync(int id)
        {
            const string sql = @"SELECT Id, Name, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive FROM RoleMaster WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Id", id);
            await using var rdr = await cmd.ExecuteReaderAsync();
            if (await rdr.ReadAsync())
            {
                return new RoleMaster
                {
                    Id = rdr.GetInt32(0),
                    Name = rdr.GetString(1),
                    CreatedDate = rdr.IsDBNull(2) ? null : rdr.GetDateTime(2),
                    CreatedBy = rdr.IsDBNull(3) ? null : (int?)rdr.GetInt32(3),
                    ModifiedDate = rdr.IsDBNull(4) ? null : rdr.GetDateTime(4),
                    ModifiedBy = rdr.IsDBNull(5) ? null : (int?)rdr.GetInt32(5),
                    IsActive = !rdr.IsDBNull(6) && rdr.GetBoolean(6)
                };
            }
            return null;
        }

        public async Task<int> CreateRoleAsync(RoleMaster m)
        {
            const string sql = @"INSERT INTO RoleMaster (Name, CreatedDate, CreatedBy, IsActive) OUTPUT INSERTED.Id VALUES(@Name,@CreatedDate,@CreatedBy,@IsActive)";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Name", m.Name ?? string.Empty);
            cmd.Parameters.AddWithValue("@CreatedDate", m.CreatedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@CreatedBy", m.CreatedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", m.IsActive);
            var id = await cmd.ExecuteScalarAsync();
            return id == null ? 0 : Convert.ToInt32(id);
        }

        public async Task<bool> UpdateRoleAsync(RoleMaster m)
        {
            const string sql = @"UPDATE RoleMaster SET Name=@Name, ModifiedDate=@ModifiedDate, ModifiedBy=@ModifiedBy, IsActive=@IsActive WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Name", m.Name ?? string.Empty);
            cmd.Parameters.AddWithValue("@ModifiedDate", m.ModifiedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedBy", m.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", m.IsActive);
            cmd.Parameters.AddWithValue("@Id", m.Id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }

        public async Task<bool> SoftDeleteRoleAsync(int id, int modifiedBy)
        {
            const string sql = @"UPDATE RoleMaster SET IsActive=0, ModifiedDate=@ModifiedDate, ModifiedBy=@ModifiedBy WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@ModifiedDate", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@ModifiedBy", modifiedBy);
            cmd.Parameters.AddWithValue("@Id", id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }
        #endregion

        #region Employees
        public async Task<List<Employee>> GetEmployeesAsync()
        {
            var list = new List<Employee>();
            const string sql = @"SELECT e.Id,e.Name,e.Email,e.Role,e.CreatedDate,e.CreatedBy,e.ModifiedDate,e.ModifiedBy,e.IsActive
                                 FROM Employees e
                                 ORDER BY e.Name";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            await using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                list.Add(new Employee
                {
                    Id = rdr.GetInt32(0),
                    Name = rdr.GetString(1),
                    Email = rdr.GetString(2),
                    Role = rdr.GetInt32(3),
                    CreatedDate = rdr.IsDBNull(4) ? null : rdr.GetDateTime(4),
                    CreatedBy = rdr.IsDBNull(5) ? null : (int?)rdr.GetInt32(5),
                    ModifiedDate = rdr.IsDBNull(6) ? null : rdr.GetDateTime(6),
                    ModifiedBy = rdr.IsDBNull(7) ? null : (int?)rdr.GetInt32(7),
                    IsActive = !rdr.IsDBNull(8) && rdr.GetBoolean(8)
                });
            }
            return list;
        }

        public async Task<Employee?> GetEmployeeByIdAsync(int id)
        {
            const string sql = @"SELECT Id,Name,Email,Role,CreatedDate,CreatedBy,ModifiedDate,ModifiedBy,IsActive FROM Employees WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Id", id);
            await using var rdr = await cmd.ExecuteReaderAsync();
            if (await rdr.ReadAsync())
            {
                return new Employee
                {
                    Id = rdr.GetInt32(0),
                    Name = rdr.GetString(1),
                    Email = rdr.GetString(2),
                    Role = rdr.GetInt32(3),
                    CreatedDate = rdr.IsDBNull(4) ? null : rdr.GetDateTime(4),
                    CreatedBy = rdr.IsDBNull(5) ? null : (int?)rdr.GetInt32(5),
                    ModifiedDate = rdr.IsDBNull(6) ? null : rdr.GetDateTime(6),
                    ModifiedBy = rdr.IsDBNull(7) ? null : (int?)rdr.GetInt32(7),
                    IsActive = !rdr.IsDBNull(8) && rdr.GetBoolean(8)
                };
            }
            return null;
        }

        public async Task<int> CreateEmployeeAsync(Employee e)
        {
            const string sql = @"INSERT INTO Employees (Name,Email,Role,CreatedDate,CreatedBy,ModifiedDate,ModifiedBy,IsActive)
                                 OUTPUT INSERTED.Id
                                 VALUES(@Name,@Email,@Role,@CreatedDate,@CreatedBy,@ModifiedDate,@ModifiedBy,@IsActive)";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Name", e.Name ?? string.Empty);
            cmd.Parameters.AddWithValue("@Email", e.Email ?? string.Empty);
            cmd.Parameters.AddWithValue("@Role", e.Role);
            cmd.Parameters.AddWithValue("@CreatedDate", e.CreatedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@CreatedBy", e.CreatedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedDate", e.ModifiedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedBy", e.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", e.IsActive);
            var id = await cmd.ExecuteScalarAsync();
            return id == null ? 0 : Convert.ToInt32(id);
        }

        public async Task<bool> UpdateEmployeeAsync(Employee e)
        {
            const string sql = @"UPDATE Employees SET Name=@Name, Email=@Email, Role=@Role, ModifiedDate=@ModifiedDate, ModifiedBy=@ModifiedBy, IsActive=@IsActive WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Name", e.Name ?? string.Empty);
            cmd.Parameters.AddWithValue("@Email", e.Email ?? string.Empty);
            cmd.Parameters.AddWithValue("@Role", e.Role);
            cmd.Parameters.AddWithValue("@ModifiedDate", e.ModifiedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedBy", e.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", e.IsActive);
            cmd.Parameters.AddWithValue("@Id", e.Id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }

        public async Task<bool> SoftDeleteEmployeeAsync(int id, int modifiedBy)
        {
            const string sql = @"UPDATE Employees SET IsActive = 0, ModifiedDate = @ModifiedDate, ModifiedBy = @ModifiedBy WHERE Id = @Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@ModifiedDate", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@ModifiedBy", modifiedBy);
            cmd.Parameters.AddWithValue("@Id", id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }
        #endregion

        #region DocumentTable
        public async Task<int> CreateDocumentAsync(string name, byte[] data, int createdBy)
        {
            const string sql = @"INSERT INTO DocumentTable (Name, Logo, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive)
                                 OUTPUT INSERTED.Id
                                 VALUES (@Name, @Logo, @CreatedDate, @CreatedBy, @ModifiedDate, @ModifiedBy, @IsActive)";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.Add("@Name", SqlDbType.VarChar, 300).Value = name ?? string.Empty;
            cmd.Parameters.Add("@Data", SqlDbType.VarBinary, -1).Value = data ?? (object)DBNull.Value;
            cmd.Parameters.AddWithValue("@CreatedDate", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@CreatedBy", createdBy);
            cmd.Parameters.AddWithValue("@ModifiedDate", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@ModifiedBy", createdBy);
            cmd.Parameters.AddWithValue("@IsActive", true);
            var id = await cmd.ExecuteScalarAsync();
            return id == null ? 0 : Convert.ToInt32(id);
        }

        public async Task<byte[]?> GetDocumentLogoAsync(int id)
        {
            const string sql = "SELECT Data FROM DocumentTable WHERE Id = @Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Id", id);
            var obj = await cmd.ExecuteScalarAsync();
            if (obj == null || obj == DBNull.Value)
                return null;

            var dataUri = obj.ToString();

            var base64Data = dataUri.Substring(dataUri.IndexOf(',') + 1);

            return Convert.FromBase64String(base64Data);
        }


        #endregion

        #region CompanyMaster
        public async Task<List<CompanyMaster>> GetCompaniesAsync(int page = 1, int pageSize = 100)
        {
            var list = new List<CompanyMaster>();
            const string sql = @"
                SELECT Id, Unikey, CompanyName, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, DocumentId, IsActive
                FROM CompanyMaster
                ORDER BY CompanyName
                OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";
            int offset = (page - 1) * pageSize;
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Offset", offset);
            cmd.Parameters.AddWithValue("@PageSize", pageSize);
            await using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                list.Add(new CompanyMaster
                {
                    Id = rdr.GetInt32(0),
                    Unikey = rdr.GetString(1),
                    CompanyName = rdr.GetString(2),
                    CreatedDate = rdr.IsDBNull(3) ? null : rdr.GetDateTime(3),
                    CreatedBy = rdr.IsDBNull(4) ? null : (int?)rdr.GetInt32(4),
                    ModifiedDate = rdr.IsDBNull(5) ? null : rdr.GetDateTime(5),
                    ModifiedBy = rdr.IsDBNull(6) ? null : (int?)rdr.GetInt32(6),
                    DocumentId = rdr.IsDBNull(7) ? null : (int?)rdr.GetInt32(7),
                    IsActive = !rdr.IsDBNull(8) && rdr.GetBoolean(8)
                });
            }
            return list;
        }

        public async Task<CompanyMaster?> GetCompanyByIdAsync(int id)
        {
            const string sql = @"SELECT Id, Unikey, CompanyName, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, DocumentId, IsActive FROM CompanyMaster WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Id", id);
            await using var rdr = await cmd.ExecuteReaderAsync();
            if (await rdr.ReadAsync())
            {
                return new CompanyMaster
                {
                    Id = rdr.GetInt32(0),
                    Unikey = rdr.GetString(1),
                    CompanyName = rdr.GetString(2),
                    CreatedDate = rdr.IsDBNull(3) ? null : rdr.GetDateTime(3),
                    CreatedBy = rdr.IsDBNull(4) ? null : (int?)rdr.GetInt32(4),
                    ModifiedDate = rdr.IsDBNull(5) ? null : rdr.GetDateTime(5),
                    ModifiedBy = rdr.IsDBNull(6) ? null : (int?)rdr.GetInt32(6),
                    DocumentId = rdr.IsDBNull(7) ? null : (int?)rdr.GetInt32(7),
                    IsActive = !rdr.IsDBNull(8) && rdr.GetBoolean(8)
                };
            }
            return null;
        }

        public async Task<int> CreateCompanyAsync(CompanyMaster c)
        {
            const string sql = @"INSERT INTO CompanyMaster (Unikey, CompanyName, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, DocumentId, IsActive)
                                 OUTPUT INSERTED.Id
                                 VALUES(@Unikey,@CompanyName,@CreatedDate,@CreatedBy,@ModifiedDate,@ModifiedBy,@DocumentId,@IsActive)";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Unikey", c.Unikey ?? string.Empty);
            cmd.Parameters.AddWithValue("@CompanyName", c.CompanyName ?? string.Empty);
            cmd.Parameters.AddWithValue("@CreatedDate", c.CreatedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@CreatedBy", c.CreatedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedDate", c.ModifiedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedBy", c.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@DocumentId", c.DocumentId ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", c.IsActive);
            var id = await cmd.ExecuteScalarAsync();
            return id == null ? 0 : Convert.ToInt32(id);
        }

        public async Task<bool> UpdateCompanyAsync(CompanyMaster c)
        {
            const string sql = @"UPDATE CompanyMaster SET Unikey=@Unikey, CompanyName=@CompanyName, ModifiedDate=@ModifiedDate, ModifiedBy=@ModifiedBy, DocumentId=@DocumentId, IsActive=@IsActive WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Unikey", c.Unikey ?? string.Empty);
            cmd.Parameters.AddWithValue("@CompanyName", c.CompanyName ?? string.Empty);
            cmd.Parameters.AddWithValue("@ModifiedDate", c.ModifiedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedBy", c.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@DocumentId", c.DocumentId ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", c.IsActive);
            cmd.Parameters.AddWithValue("@Id", c.Id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }

        public async Task<bool> SoftDeleteCompanyAsync(int id, int modifiedBy)
        {
            const string sql = @"UPDATE CompanyMaster SET IsActive=0, ModifiedDate=@ModifiedDate, ModifiedBy=@ModifiedBy WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@ModifiedDate", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@ModifiedBy", modifiedBy);
            cmd.Parameters.AddWithValue("@Id", id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }
        #endregion

        #region LicenseTypeMaster
        public async Task<List<LicenseTypeMaster>> GetLicenseTypesAsync()
        {
            var list = new List<LicenseTypeMaster>();
            const string sql = @"SELECT Id, Unikey, AppTypeName, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive FROM LicenseTypeMaster ORDER BY AppTypeName";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            await using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                list.Add(new LicenseTypeMaster
                {
                    Id = rdr.GetInt32(0),
                    Unikey = rdr.GetString(1),
                    AppTypeName = rdr.GetString(2),
                    CreatedDate = rdr.IsDBNull(3) ? null : rdr.GetDateTime(3),
                    CreatedBy = rdr.IsDBNull(4) ? null : (int?)rdr.GetInt32(4),
                    ModifiedDate = rdr.IsDBNull(5) ? null : rdr.GetDateTime(5),
                    ModifiedBy = rdr.IsDBNull(6) ? null : (int?)rdr.GetInt32(6),
                    IsActive = !rdr.IsDBNull(7) && rdr.GetBoolean(7)
                });
            }
            return list;
        }

        public async Task<LicenseTypeMaster?> GetLicenseTypeByIdAsync(int id)
        {
            const string sql = @"SELECT Id, AppTypeName, IsActive 
                         FROM LicenseTypeMaster 
                         WHERE Id = @Id";

            await using var con = Conn();
            await con.OpenAsync();

            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Id", id);

            await using var rdr = await cmd.ExecuteReaderAsync();

            if (await rdr.ReadAsync())
            {
                return new LicenseTypeMaster
                {
                    Id = rdr.GetInt32(0),
                    AppTypeName = rdr.GetString(1),
                    IsActive = !rdr.IsDBNull(2) && rdr.GetBoolean(2)
                };
            }

            return null;
        }


        public async Task<int> CreateLicenseTypeAsync(LicenseTypeMaster t)
        {
            const string sql = @"INSERT INTO LicenseTypeMaster (Unikey, AppTypeName, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive)
                                 OUTPUT INSERTED.Id
                                 VALUES(@Unikey,@AppTypeName,@CreatedDate,@CreatedBy,@ModifiedDate,@ModifiedBy,@IsActive)";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Unikey", t.Unikey ?? string.Empty);
            cmd.Parameters.AddWithValue("@AppTypeName", t.AppTypeName ?? string.Empty);
            cmd.Parameters.AddWithValue("@CreatedDate", t.CreatedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@CreatedBy", t.CreatedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedDate", t.ModifiedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedBy", t.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", t.IsActive);
            var id = await cmd.ExecuteScalarAsync();
            return id == null ? 0 : Convert.ToInt32(id);
        }

        public async Task<bool> UpdateLicenseTypeAsync(LicenseTypeMaster t)
        {
            const string sql = @"UPDATE LicenseTypeMaster SET Unikey=@Unikey, AppTypeName=@AppTypeName, ModifiedDate=@ModifiedDate, ModifiedBy=@ModifiedBy, IsActive=@IsActive WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Unikey", t.Unikey ?? string.Empty);
            cmd.Parameters.AddWithValue("@AppTypeName", t.AppTypeName ?? string.Empty);
            cmd.Parameters.AddWithValue("@ModifiedDate", t.ModifiedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedBy", t.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", t.IsActive);
            cmd.Parameters.AddWithValue("@Id", t.Id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }

        public async Task<bool> SoftDeleteLicenseTypeAsync(int id, int modifiedBy)
        {
            const string sql = @"UPDATE LicenseTypeMaster SET IsActive=0, ModifiedDate=@ModifiedDate, ModifiedBy=@ModifiedBy WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@ModifiedDate", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@ModifiedBy", modifiedBy);
            cmd.Parameters.AddWithValue("@Id", id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }
        #endregion

        #region StatusMaster
        public async Task<List<StatusMaster>> GetStatusesAsync()
        {
            var list = new List<StatusMaster>();
            const string sql = @"SELECT Id, Unikey, StatusName, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive FROM StatusMaster ORDER BY StatusName";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            await using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                list.Add(new StatusMaster
                {
                    Id = rdr.GetInt32(0),
                    Unikey = rdr.GetString(1),
                    StatusName = rdr.GetString(2),
                    CreatedDate = rdr.IsDBNull(3) ? null : rdr.GetDateTime(3),
                    CreatedBy = rdr.IsDBNull(4) ? null : (int?)rdr.GetInt32(4),
                    ModifiedDate = rdr.IsDBNull(5) ? null : rdr.GetDateTime(5),
                    ModifiedBy = rdr.IsDBNull(6) ? null : (int?)rdr.GetInt32(6),
                    IsActive = !rdr.IsDBNull(7) && rdr.GetBoolean(7)
                });
            }
            return list;
        }

        public async Task<StatusMaster?> GetStatusByIdAsync(int id)
        {
            const string sql = @"SELECT Id, StatusName, IsActive
                         FROM StatusMaster
                         WHERE Id = @Id";

            await using var con = Conn();
            await con.OpenAsync();

            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Id", id);

            await using var rdr = await cmd.ExecuteReaderAsync();

            if (await rdr.ReadAsync())
            {
                return new StatusMaster
                {
                    Id = rdr.GetInt32(0),
                    StatusName = rdr.GetString(1),
                    IsActive = !rdr.IsDBNull(2) && rdr.GetBoolean(2)
                };
            }

            return null;
        }


        public async Task<int> CreateStatusAsync(StatusMaster s)
        {
            const string sql = @"INSERT INTO StatusMaster (Unikey, StatusName, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive)
                                 OUTPUT INSERTED.Id
                                 VALUES(@Unikey,@StatusName,@CreatedDate,@CreatedBy,@ModifiedDate,@ModifiedBy,@IsActive)";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Unikey", s.Unikey ?? string.Empty);
            cmd.Parameters.AddWithValue("@StatusName", s.StatusName ?? string.Empty);
            cmd.Parameters.AddWithValue("@CreatedDate", s.CreatedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@CreatedBy", s.CreatedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedDate", s.ModifiedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedBy", s.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", s.IsActive);
            var id = await cmd.ExecuteScalarAsync();
            return id == null ? 0 : Convert.ToInt32(id);
        }

        public async Task<bool> UpdateStatusAsync(StatusMaster s)
        {
            const string sql = @"UPDATE StatusMaster SET Unikey=@Unikey, StatusName=@StatusName, ModifiedDate=@ModifiedDate, ModifiedBy=@ModifiedBy, IsActive=@IsActive WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Unikey", s.Unikey ?? string.Empty);
            cmd.Parameters.AddWithValue("@StatusName", s.StatusName ?? string.Empty);
            cmd.Parameters.AddWithValue("@ModifiedDate", s.ModifiedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedBy", s.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", s.IsActive);
            cmd.Parameters.AddWithValue("@Id", s.Id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }

        public async Task<bool> SoftDeleteStatusAsync(int id, int modifiedBy)
        {
            const string sql = @"UPDATE StatusMaster SET IsActive=0, ModifiedDate=@ModifiedDate, ModifiedBy=@ModifiedBy WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@ModifiedDate", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@ModifiedBy", modifiedBy);
            cmd.Parameters.AddWithValue("@Id", id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }
        #endregion

        #region Tickets
        // Tickets - fixed column order to include CompanyAddress in SELECT so mapping uses correct indexes
        public async Task<List<Ticket>> GetTicketsAsync()
        {
            var list = new List<Ticket>();
            const string sql = @"SELECT Id, CompanyId, EmployeeId, LicenseId, StatusId, CompanyAddress, Description, TrackingNumber, ValidTill, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy
                                 FROM Tickets ORDER BY CreatedDate DESC";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            await using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                list.Add(new Ticket
                {
                    Id = rdr.GetInt32(0),
                    CompanyId = rdr.GetInt32(1),
                    EmployeeId = rdr.GetInt32(2),
                    LicenseId = rdr.GetInt32(3),
                    StatusId = rdr.GetInt32(4),
                    CompanyAddress = rdr.IsDBNull(5) ? null : rdr.GetString(5),
                    Description = rdr.IsDBNull(6) ? null : rdr.GetString(6),
                    TrackingNumber = rdr.IsDBNull(7) ? null : (int?)rdr.GetInt32(7),
                    ValidTill = rdr.IsDBNull(8) ? null : (DateTime?)rdr.GetDateTime(8),
                    CreatedDate = rdr.IsDBNull(9) ? null : (DateTime?)rdr.GetDateTime(9),
                    CreatedBy = rdr.IsDBNull(10) ? null : (int?)rdr.GetInt32(10),
                    ModifiedDate = rdr.IsDBNull(11) ? null : (DateTime?)rdr.GetDateTime(11),
                    ModifiedBy = rdr.IsDBNull(12) ? null : (int?)rdr.GetInt32(12)
                });
            }
            return list;
        }

        public async Task<Ticket?> GetTicketByIdAsync(int id)
        {
            const string sql = @"SELECT Id, CompanyId, EmployeeId, LicenseId, StatusId, CompanyAddress, Description, TrackingNumber, ValidTill, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy FROM Tickets WHERE TrackingNumber=@Id or Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Id", id);
            await using var rdr = await cmd.ExecuteReaderAsync();
            if (await rdr.ReadAsync())
            {
                return new Ticket
                {
                    Id = rdr.GetInt32(0),
                    CompanyId = rdr.GetInt32(1),
                    EmployeeId = rdr.GetInt32(2),
                    LicenseId = rdr.GetInt32(3),
                    StatusId = rdr.GetInt32(4),
                    CompanyAddress = rdr.IsDBNull(5) ? null : rdr.GetString(5),
                    Description = rdr.IsDBNull(6) ? null : rdr.GetString(6),
                    TrackingNumber = rdr.IsDBNull(7) ? null : (int?)rdr.GetInt32(7),
                    ValidTill = rdr.IsDBNull(8) ? null : (DateTime?)rdr.GetDateTime(8),
                    CreatedDate = rdr.IsDBNull(9) ? null : (DateTime?)rdr.GetDateTime(9),
                    CreatedBy = rdr.IsDBNull(10) ? null : (int?)rdr.GetInt32(10),
                    ModifiedDate = rdr.IsDBNull(11) ? null : (DateTime?)rdr.GetDateTime(11),
                    ModifiedBy = rdr.IsDBNull(12) ? null : (int?)rdr.GetInt32(12)
                };
            }
            return null;
        }

        public async Task<int> CreateTicketAsync(Ticket t)
        {
            try
            {
                const string sql = @"
                INSERT INTO Tickets
                (
                    CompanyId, EmployeeId, LicenseId, StatusId,
                    CompanyAddress, Description, TrackingNumber,
                    ValidTill, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy
                )
                OUTPUT INSERTED.TrackingNumber
                SELECT
                    @CompanyId, @EmployeeId, @LicenseId, @StatusId,
                    @CompanyAddress, @Description,
                    ISNULL(MAX(TrackingNumber), 1000) + 1,
                    @ValidTill, @CreatedDate, @CreatedBy, @ModifiedDate, @ModifiedBy
                FROM Tickets WITH (UPDLOCK, HOLDLOCK);";
                await using var con = Conn();
                await con.OpenAsync();
                await using var cmd = new SqlCommand(sql, con);
                cmd.Parameters.AddWithValue("@CompanyId", t.CompanyId);
                cmd.Parameters.AddWithValue("@EmployeeId", t.EmployeeId);
                cmd.Parameters.AddWithValue("@LicenseId", t.LicenseId);
                cmd.Parameters.AddWithValue("@StatusId", t.StatusId);
                cmd.Parameters.AddWithValue("@CompanyAddress", (object?)t.CompanyAddress ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Description", (object?)t.Description ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@ValidTill", t.ValidTill ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@CreatedDate", t.CreatedDate ?? DateTime.UtcNow);
                cmd.Parameters.AddWithValue("@CreatedBy", t.CreatedBy ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ModifiedDate", t.ModifiedDate ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ModifiedBy", t.ModifiedBy ?? (object)DBNull.Value);
                var TrackingNumber = await cmd.ExecuteScalarAsync();
                return TrackingNumber == null ? 0 : Convert.ToInt32(TrackingNumber);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public async Task<bool> UpdateTicketAsync(Ticket t)
        {
            const string sql = @"UPDATE Tickets SET CompanyId=@CompanyId, EmployeeId=@EmployeeId, LicenseId=@LicenseId, StatusId=@StatusId, CompanyAddress=@CompanyAddress, Description=@Description, TrackingNumber=@TrackingNumber, ValidTill=@ValidTill, ModifiedDate=@ModifiedDate, ModifiedBy=@ModifiedBy WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@CompanyId", t.CompanyId);
            cmd.Parameters.AddWithValue("@EmployeeId", t.EmployeeId);
            cmd.Parameters.AddWithValue("@LicenseId", t.LicenseId);
            cmd.Parameters.AddWithValue("@StatusId", t.StatusId);
            cmd.Parameters.AddWithValue("@CompanyAddress", (object?)t.CompanyAddress ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Description", (object?)t.Description ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@TrackingNumber", (object?)t.TrackingNumber ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@ValidTill", t.ValidTill ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedDate", t.ModifiedDate ?? DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@ModifiedBy", t.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Id", t.Id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }


        public async Task<bool> SoftDeleteTicketAsync(int id, int modifiedBy)
        {
            // Tickets table in original schema has no IsActive column — perform hard delete. Change to an update if you add IsActive.
            const string sql = @"DELETE FROM Tickets WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Id", id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }

        // Add this method inside the Tickets region (e.g. after GetTicketsAsync and before GetTicketByIdAsync)
        public async Task<List<Ticket>> GetTicketsByFilterAsync(TicketFilterRequest? filter)
        {
            filter ??= new Investica.Models.TicketFilterRequest();

            var list = new List<Ticket>();
            var sb = new System.Text.StringBuilder();
            sb.Append(@"SELECT Id, CompanyId, EmployeeId, LicenseId, StatusId, CompanyAddress, Description, TrackingNumber, ValidTill, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy
                FROM Tickets
                WHERE 1=1");

            var parameters = new List<SqlParameter>();

            if (filter.CompanyId.HasValue)
            {
                sb.Append(" AND CompanyId = @CompanyId");
                parameters.Add(new SqlParameter("@CompanyId", filter.CompanyId.Value));
            }

            if (filter.LicenseType.HasValue)
            {
                sb.Append(" AND LicenseId = @LicenseId");
                parameters.Add(new SqlParameter("@LicenseId", filter.LicenseType.Value));
            }

            if (filter.Status.HasValue)
            {
                sb.Append(" AND StatusId = @StatusId");
                parameters.Add(new SqlParameter("@StatusId", filter.Status.Value));
            }

            if (!string.IsNullOrWhiteSpace(filter.TrackingNumber))
            {
                sb.Append(" AND CAST(TrackingNumber AS VARCHAR(100)) LIKE @TrackingPattern");
                parameters.Add(new SqlParameter("@TrackingPattern", "%" + filter.TrackingNumber + "%"));
            }

            if (filter.StartDate.HasValue)
            {
                sb.Append(" AND CreatedDate >= @StartDate");
                parameters.Add(new SqlParameter("@StartDate", filter.StartDate.Value));
            }

            if (filter.EndDate.HasValue)
            {
                // treat EndDate as inclusive end-of-day
                var endOfDay = filter.EndDate.Value.Date.AddDays(1).AddTicks(-1);
                sb.Append(" AND CreatedDate <= @EndDate");
                parameters.Add(new SqlParameter("@EndDate", endOfDay));
            }

            sb.Append(" ORDER BY CreatedDate DESC");

            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sb.ToString(), con);

            if (parameters.Count > 0)
                cmd.Parameters.AddRange(parameters.ToArray());

            await using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                list.Add(new Ticket
                {
                    Id = rdr.GetInt32(0),
                    CompanyId = rdr.GetInt32(1),
                    EmployeeId = rdr.GetInt32(2),
                    LicenseId = rdr.GetInt32(3),
                    StatusId = rdr.GetInt32(4),
                    CompanyAddress = rdr.IsDBNull(5) ? null : rdr.GetString(5),
                    Description = rdr.IsDBNull(6) ? null : rdr.GetString(6),
                    TrackingNumber = rdr.IsDBNull(7) ? null : (int?)rdr.GetInt32(7),
                    ValidTill = rdr.IsDBNull(8) ? null : (DateTime?)rdr.GetDateTime(8),
                    CreatedDate = rdr.IsDBNull(9) ? null : (DateTime?)rdr.GetDateTime(9),
                    CreatedBy = rdr.IsDBNull(10) ? null : (int?)rdr.GetInt32(10),
                    ModifiedDate = rdr.IsDBNull(11) ? null : (DateTime?)rdr.GetDateTime(11),
                    ModifiedBy = rdr.IsDBNull(12) ? null : (int?)rdr.GetInt32(12)
                });
            }

            return list;
        }

        public async Task<int> CreateNoteAsync(int ticketId, string noteText, int userId)
        {
            var sql = @"
        INSERT INTO Logs 
        (TableName, ActionType, RecordId, OldValue, NewValue, ModifiedBy, ModifiedDate, CreatedBy, CreatedDate)
        VALUES 
        (@TableName, @ActionType, @RecordId, @OldValue, @NewValue, @ModifiedBy, @ModifiedDate, @CreatedBy, @CreatedDate);
        SELECT CAST(SCOPE_IDENTITY() AS INT);";

            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);

            cmd.Parameters.AddWithValue("@TableName", "Tickets");
            cmd.Parameters.AddWithValue("@ActionType", "NOTE");
            cmd.Parameters.AddWithValue("@RecordId", ticketId);
            cmd.Parameters.AddWithValue("@OldValue", DBNull.Value);
            cmd.Parameters.AddWithValue("@NewValue", noteText);
            cmd.Parameters.AddWithValue("@ModifiedBy", userId);
            cmd.Parameters.AddWithValue("@ModifiedDate", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@CreatedBy", userId);
            cmd.Parameters.AddWithValue("@CreatedDate", DateTime.UtcNow);

            var id = (int)await cmd.ExecuteScalarAsync();
            return id;
        }

        public async Task<List<Log>> GetNotesByTicketIdAsync(int ticketId)
        {
            var list = new List<Log>();
            var sql = @"
        SELECT Id, TableName, ActionType, RecordId, OldValue, NewValue, 
               ModifiedBy, ModifiedDate, CreatedBy, CreatedDate
        FROM Logs
        WHERE TableName = @TableName 
          AND ActionType = @ActionType 
          AND RecordId = @RecordId
        ORDER BY CreatedDate DESC";

            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);

            cmd.Parameters.AddWithValue("@TableName", "Tickets");
            cmd.Parameters.AddWithValue("@ActionType", "NOTE");
            cmd.Parameters.AddWithValue("@RecordId", ticketId);

            await using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                list.Add(new Log
                {
                    Id = rdr.GetInt32(0),
                    TableName = rdr.IsDBNull(1) ? null : rdr.GetString(1),
                    ActionType = rdr.IsDBNull(2) ? null : rdr.GetString(2),
                    RecordId = (int)(rdr.IsDBNull(3) ? null : (int?)rdr.GetInt32(3)),
                    OldValue = rdr.IsDBNull(4) ? null : rdr.GetString(4),
                    NewValue = rdr.IsDBNull(5) ? null : rdr.GetString(5),
                    ModifiedBy = rdr.IsDBNull(6) ? null : (int?)rdr.GetInt32(6),
                    ModifiedDate = rdr.IsDBNull(7) ? null : (DateTime?)rdr.GetDateTime(7),
                    CreatedBy = rdr.GetInt32(8),
                    CreatedDate = rdr.IsDBNull(9) ? null : (DateTime?)rdr.GetDateTime(9)
                });
            }
            return list;
        }

        public async Task<Log> GetNoteByIdAsync(int id)
        {
            var sql = @"
        SELECT Id, TableName, ActionType, RecordId, OldValue, NewValue, 
               ModifiedBy, ModifiedDate, CreatedBy, CreatedDate
        FROM Logs
        WHERE Id = @Id AND ActionType = @ActionType";

            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);

            cmd.Parameters.AddWithValue("@Id", id);
            cmd.Parameters.AddWithValue("@ActionType", "NOTE");

            await using var rdr = await cmd.ExecuteReaderAsync();
            if (await rdr.ReadAsync())
            {
                return new Log
                {
                    Id = rdr.GetInt32(0),
                    TableName = rdr.IsDBNull(1) ? null : rdr.GetString(1),
                    ActionType = rdr.IsDBNull(2) ? null : rdr.GetString(2),
                    RecordId = (int)(rdr.IsDBNull(3) ? null : (int?)rdr.GetInt32(3)),
                    OldValue = rdr.IsDBNull(4) ? null : rdr.GetString(4),
                    NewValue = rdr.IsDBNull(5) ? null : rdr.GetString(5),
                    ModifiedBy = rdr.IsDBNull(6) ? null : (int?)rdr.GetInt32(6),
                    ModifiedDate = rdr.IsDBNull(7) ? null : (DateTime?)rdr.GetDateTime(7),
                    CreatedBy = rdr.GetInt32(8),
                    CreatedDate = rdr.IsDBNull(9) ? null : (DateTime?)rdr.GetDateTime(9)
                };
            }
            return null;
        }


        // Attachment Section in the tickets and tis is the code of the service 
        public async Task<List<TicketAttachment>> GetByTicketIdAsync(int ticketId)
        {
            var list = new List<TicketAttachment>();
            const string sql = @"SELECT Id, TicketId, FileTypeId, FileName, ContentType, FileSizeBytes, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive
                             FROM dbo.TicketAttachments WHERE TicketId = @TicketId AND IsActive = 1 ORDER BY CreatedDate DESC";

            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@TicketId", ticketId);
            await using var rdr = await cmd.ExecuteReaderAsync();

            while (await rdr.ReadAsync())
            {
                list.Add(new TicketAttachment
                {
                    Id = rdr.GetInt32(0),
                    TicketId = rdr.GetInt32(1),
                    FileTypeId = rdr.GetInt32(2),
                    FileName = rdr.IsDBNull(3) ? null : rdr.GetString(3),
                    ContentType = rdr.IsDBNull(4) ? null : rdr.GetString(4),
                    FileSizeBytes = rdr.IsDBNull(5) ? null : (long?)rdr.GetInt64(5),
                    CreatedDate = rdr.IsDBNull(6) ? null : (DateTime?)rdr.GetDateTime(6),
                    CreatedBy = rdr.IsDBNull(7) ? null : (int?)rdr.GetInt32(7),
                    ModifiedDate = rdr.IsDBNull(8) ? null : (DateTime?)rdr.GetDateTime(8),
                    ModifiedBy = rdr.IsDBNull(9) ? null : (int?)rdr.GetInt32(9),
                    IsActive = rdr.GetBoolean(10)
                });
            }
            return list;
        }
        public async Task<TicketAttachment> SaveAsync(TicketAttachment attachment)
        {
            const string sql = @"INSERT INTO dbo.TicketAttachments (TicketId, FileTypeId, FileName, ContentType, Base64Data, FileSizeBytes, CreatedDate, CreatedBy, IsActive)
                             VALUES (@TicketId, @FileTypeId, @FileName, @ContentType, @Base64Data, @FileSizeBytes, GETDATE(), @CreatedBy, 1);
                             SELECT SCOPE_IDENTITY();";

            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);

            cmd.Parameters.AddWithValue("@TicketId", attachment.TicketId);
            cmd.Parameters.AddWithValue("@FileTypeId", attachment.FileTypeId);
            cmd.Parameters.AddWithValue("@FileName", attachment.FileName);
            cmd.Parameters.AddWithValue("@ContentType", attachment.ContentType);
            cmd.Parameters.AddWithValue("@Base64Data", attachment.Base64Data);
            cmd.Parameters.AddWithValue("@FileSizeBytes", attachment.FileSizeBytes.HasValue ? (object)attachment.FileSizeBytes.Value : DBNull.Value);
            cmd.Parameters.AddWithValue("@CreatedBy", attachment.CreatedBy.HasValue ? (object)attachment.CreatedBy.Value : DBNull.Value);

            object result = await cmd.ExecuteScalarAsync();
            attachment.Id = Convert.ToInt32(result);
            attachment.IsActive = true;

            return attachment;
        }
        public async Task<TicketAttachmentDownload> DownloadAsync(int id)
        {
            const string sql = @"SELECT FileName, ContentType, Base64Data
                             FROM dbo.TicketAttachments WHERE Id = @Id AND IsActive = 1";

            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.CommandTimeout = 120;
            cmd.Parameters.AddWithValue("@Id", id);
            await using var rdr = await cmd.ExecuteReaderAsync();
            
            if (await rdr.ReadAsync())
            {
                return new TicketAttachmentDownload
                {
                    FileName = rdr.GetString(0),
                    ContentType = rdr.GetString(1),
                    Base64Data = rdr.GetString(2)
                };
            }
            return null;
        }
        public async Task DeleteAsync(int id, int modifiedBy)
        {
            const string sql = @"UPDATE dbo.TicketAttachments SET IsActive = 0, ModifiedDate = GETDATE(), ModifiedBy = @ModifiedBy WHERE Id = @Id";

            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.Parameters.AddWithValue("@ModifiedBy", modifiedBy);

            await cmd.ExecuteNonQueryAsync();
        }

        #endregion

        #region UpcomingRenewals
        public async Task<List<UpcomingRenewalDto>> GetAllWithDetailsAsync()
        {
            var list = new List<UpcomingRenewalDto>();

            const string sql = @"
                SELECT
                    lr.Id,
                    lr.CompanyId,
                    cm.CompanyName,
                    lr.Code,
                    lr.LicenseTypeId,
                    lt.AppTypeName AS LicenseType,
                    lr.CityState,
                    lr.Address,
                    lr.ExpiryDate,
                    lr.ExpiryMonth,
                    lr.ExpiryYear,
                    lr.Remarks,
                    lr.CreatedDate,
                    lr.CreatedBy,
                    lr.ModifiedDate,
                    lr.ModifiedBy,
                    lr.IsActive
                FROM LicenseRenewal lr
                INNER JOIN CompanyMaster cm ON lr.CompanyId = cm.Id
                INNER JOIN LicenseTypeMaster lt ON lr.LicenseTypeId = lt.Id
                WHERE lr.IsActive = 1
               ";

            await using var con = Conn();
            await con.OpenAsync();

            await using var cmd = new SqlCommand(sql, con);
            await using var rdr = await cmd.ExecuteReaderAsync();

            while (await rdr.ReadAsync())
            {
                var dto = new UpcomingRenewalDto
                {
                    Id = rdr.GetInt32(0),
                    CompanyId = rdr.GetInt32(1),
                    CompanyName = rdr.GetString(2),
                    Unikey = rdr.IsDBNull(3) ? null : rdr.GetString(3),
                    LicenseTypeId = rdr.GetInt32(4),
                    LicenseType = rdr.GetString(5),
                    CityState = rdr.GetString(6),
                    Address = rdr.GetString(7),
                    ExpiryDate = rdr.GetDateTime(8),
                    ExpiryMonth = rdr.GetString(9),
                    ExpiryYear = rdr.GetInt32(10),
                    Remarks = rdr.IsDBNull(11) ? null : rdr.GetString(11),
                    CreatedDate = rdr.IsDBNull(12) ? null : rdr.GetDateTime(12),
                    CreatedBy = rdr.IsDBNull(13) ? null : rdr.GetInt32(13),
                    ModifiedDate = rdr.IsDBNull(14) ? null : rdr.GetDateTime(14),
                    ModifiedBy = rdr.IsDBNull(15) ? null : rdr.GetInt32(15),
                    IsActive = rdr.GetBoolean(16)
                };

                // Calculate status and days
                CalculateStatus(dto);

                list.Add(dto);
            }

            return list;
        }

        // ═══════════════════════════════════════════════════════════
        //  GET BY ID WITH JOINS
        // ═══════════════════════════════════════════════════════════
        public async Task<UpcomingRenewalDto?> GetByIdWithDetailsAsync(int id)
        {
            const string sql = @"
                SELECT
                    lr.Id,
                    lr.CompanyId,
                    cm.CompanyName,
                    lr.Code,
                    lr.LicenseTypeId,
                    lt.AppTypeName AS LicenseType,
                    lr.CityState,
                    lr.Address,
                    lr.ExpiryDate,
                    lr.ExpiryMonth,
                    lr.ExpiryYear,
                    lr.Remarks,
                    lr.CreatedDate,
                    lr.CreatedBy,
                    lr.ModifiedDate,
                    lr.ModifiedBy,
                    lr.IsActive
                FROM LicenseRenewal lr
                INNER JOIN CompanyMaster cm ON lr.CompanyId = cm.Id
                INNER JOIN LicenseTypeMaster lt ON lr.LicenseTypeId = lt.Id
                WHERE lr.Id = @Id";

            await using var con = Conn();
            await con.OpenAsync();

            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Id", id);

            await using var rdr = await cmd.ExecuteReaderAsync();

            if (await rdr.ReadAsync())
            {
                var dto = new UpcomingRenewalDto
                {
                    Id = rdr.GetInt32(0),
                    CompanyId = rdr.GetInt32(1),
                    CompanyName = rdr.GetString(2),
                    Unikey = rdr.IsDBNull(3) ? null : rdr.GetString(3),
                    LicenseTypeId = rdr.GetInt32(4),
                    LicenseType = rdr.GetString(5),
                    CityState = rdr.GetString(6),
                    Address = rdr.GetString(7),
                    ExpiryDate = rdr.GetDateTime(8),
                    ExpiryMonth = rdr.GetString(9),
                    ExpiryYear = rdr.GetInt32(10),
                    Remarks = rdr.IsDBNull(11) ? null : rdr.GetString(11),
                    CreatedDate = rdr.IsDBNull(12) ? null : rdr.GetDateTime(12),
                    CreatedBy = rdr.IsDBNull(13) ? null : rdr.GetInt32(13),
                    ModifiedDate = rdr.IsDBNull(14) ? null : rdr.GetDateTime(14),
                    ModifiedBy = rdr.IsDBNull(15) ? null : rdr.GetInt32(15),
                    IsActive = rdr.GetBoolean(16)
                };

                CalculateStatus(dto);
                return dto;
            }

            return null;
        }

        // ═══════════════════════════════════════════════════════════
        //  CREATE
        // ═══════════════════════════════════════════════════════════
        public async Task<int> CreateAsync(LicenseRenewalRequest request)
        {
            const string sql = @"
                INSERT INTO LicenseRenewal
                (
                    CompanyId,
                    LicenseTypeId,
                    CityState,
                    Address,
                    ExpiryDate,
                    ExpiryMonth,
                    ExpiryYear,
                    Remarks,
                    CreatedDate,
                    CreatedBy,
                    ModifiedDate,
                    ModifiedBy,
                    IsActive
                )
                OUTPUT INSERTED.Id
                VALUES
                (
                    @CompanyId,
                    @LicenseTypeId,
                    @CityState,
                    @Address,
                    @ExpiryDate,
                    @ExpiryMonth,
                    @ExpiryYear,
                    @Remarks,
                    @CreatedDate,
                    @CreatedBy,
                    @ModifiedDate,
                    @ModifiedBy,
                    @IsActive
                )";

            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);

            // Auto-calculate month and year from ExpiryDate
            var expiryMonth = request.ExpiryDate.ToString("MMMM");
            var expiryYear = request.ExpiryDate.Year;

            cmd.Parameters.AddWithValue("@CompanyId", request.CompanyId);
            cmd.Parameters.AddWithValue("@LicenseTypeId", request.LicenseTypeId);
            cmd.Parameters.AddWithValue("@CityState", request.CityState);
            cmd.Parameters.AddWithValue("@Address", request.Address);
            cmd.Parameters.AddWithValue("@ExpiryDate", request.ExpiryDate.Date);
            cmd.Parameters.AddWithValue("@ExpiryMonth", expiryMonth);
            cmd.Parameters.AddWithValue("@ExpiryYear", expiryYear);
            cmd.Parameters.AddWithValue("@Remarks", (object?)request.Remarks ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@CreatedDate", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@CreatedBy", DBNull.Value); // TODO: Add user tracking
            cmd.Parameters.AddWithValue("@ModifiedDate", DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedBy", DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", request.IsActive);

            var id = await cmd.ExecuteScalarAsync();
            return id == null ? 0 : Convert.ToInt32(id);
        }

        // ═══════════════════════════════════════════════════════════
        //  UPDATE
        // ═══════════════════════════════════════════════════════════
        public async Task<bool> UpdateAsync(int id, LicenseRenewalRequest request)
        {
            const string sql = @"
                UPDATE LicenseRenewal
                SET 
                    Code = @Code,
                    CompanyId = @CompanyId,
                    LicenseTypeId = @LicenseTypeId,
                    CityState = @CityState,
                    Address = @Address,
                    ExpiryDate = @ExpiryDate,
                    ExpiryMonth = @ExpiryMonth,
                    ExpiryYear = @ExpiryYear,
                    Remarks = @Remarks,
                    ModifiedDate = @ModifiedDate,
                    ModifiedBy = @ModifiedBy,
                    IsActive = @IsActive
                WHERE Id = @Id";

            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);

            // Auto-calculate month and year from ExpiryDate
            var expiryMonth = request.ExpiryDate.ToString("MMMM");
            var expiryYear = request.ExpiryDate.Year;

            cmd.Parameters.AddWithValue("@Id", id);
            cmd.Parameters.AddWithValue("@Code", request.Unique);
            cmd.Parameters.AddWithValue("@CompanyId", request.CompanyId);
            cmd.Parameters.AddWithValue("@LicenseTypeId", request.LicenseTypeId);
            cmd.Parameters.AddWithValue("@CityState", request.CityState);
            cmd.Parameters.AddWithValue("@Address", request.Address);
            cmd.Parameters.AddWithValue("@ExpiryDate", request.ExpiryDate.Date);
            cmd.Parameters.AddWithValue("@ExpiryMonth", expiryMonth);
            cmd.Parameters.AddWithValue("@ExpiryYear", expiryYear);
            cmd.Parameters.AddWithValue("@Remarks", (object?)request.Remarks ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedDate", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@ModifiedBy", DBNull.Value); // TODO: Add user tracking
            cmd.Parameters.AddWithValue("@IsActive", request.IsActive);

            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }

        // ═══════════════════════════════════════════════════════════
        //  DELETE (Soft delete - sets IsActive = false)
        // ═══════════════════════════════════════════════════════════
        public async Task<bool> DeleteAsync(int id)
        {
            const string sql = @"
                UPDATE LicenseRenewal
                SET 
                    IsActive = 0,
                    ModifiedDate = @ModifiedDate
                WHERE Id = @Id";

            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);

            cmd.Parameters.AddWithValue("@Id", id);
            cmd.Parameters.AddWithValue("@ModifiedDate", DateTime.UtcNow);

            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }

    
        public async Task<DropdownData> GetDropdownDataAsync()
        {
            var data = new DropdownData();

            await using var con = Conn();
            await con.OpenAsync();

            // Get Companies
            {
                const string companySql = "SELECT Id, CompanyName FROM CompanyMaster WHERE IsActive = 1 ORDER BY CompanyName";
                await using var cmdCompany = new SqlCommand(companySql, con);
                await using var rdrCompany = await cmdCompany.ExecuteReaderAsync();
                while (await rdrCompany.ReadAsync())
                {
                    data.Companies.Add(new DropdownItem
                    {
                        Id = rdrCompany.GetInt32(0),
                        Name = rdrCompany.GetString(1)
                    });
                }
            }

            // Get License Types
            {
                const string licenseSql = "SELECT Id, AppTypeName FROM LicenseTypeMaster WHERE IsActive = 1 ORDER BY AppTypeName";
                await using var cmdLicense = new SqlCommand(licenseSql, con);
                await using var rdrLicense = await cmdLicense.ExecuteReaderAsync();
                while (await rdrLicense.ReadAsync())
                {
                    data.LicenseTypes.Add(new DropdownItem
                    {
                        Id = rdrLicense.GetInt32(0),
                        Name = rdrLicense.GetString(1)
                    });
                }
            }

            // Get Unique Locations
            {
                const string locationSql = "SELECT DISTINCT CityState FROM LicenseRenewal WHERE IsActive = 1 AND CityState IS NOT NULL ORDER BY CityState";
                await using var cmdLocation = new SqlCommand(locationSql, con);
                await using var rdrLocation = await cmdLocation.ExecuteReaderAsync();
                while (await rdrLocation.ReadAsync())
                {
                    data.Locations.Add(rdrLocation.GetString(0));
                }
            }

            // Get Codes
            {
                const string codeSql = "SELECT Code FROM LicenseRenewal WHERE IsActive = 1";
                await using var cmdCode = new SqlCommand(codeSql, con);
                await using var rdrCode = await cmdCode.ExecuteReaderAsync();
                while (await rdrCode.ReadAsync())
                {
                    data.Code.Add(rdrCode.IsDBNull(0) ? null : rdrCode.GetString(0));
                }
            }

            return data;
        }

 
        private void CalculateStatus(UpcomingRenewalDto dto)
        {
            var today = DateTime.Today;
            var daysUntilExpiry = (dto.ExpiryDate.Date - today).Days;

            dto.DaysUntilExpiry = daysUntilExpiry;
            dto.ExpiryDateFormatted = dto.ExpiryDate.ToString("dd-MMM-yyyy");

            if (daysUntilExpiry < 0)
                dto.Status = "EXPIRED";
            else if (daysUntilExpiry <= 30)
                dto.Status = "URGENT";
            else if (daysUntilExpiry <= 60)
                dto.Status = "DUE SOON";
            else
                dto.Status = "PENDING";
        }
        #endregion

        #region FontSheet
        // Add near other dropdown / master-data methods
        public async Task<List<DropdownItem>> GetEntityTypesAsync()
        {
            var list = new List<DropdownItem>();
            const string sql = "SELECT Id, EntityType FROM EntitType WHERE IsActive = 1 ORDER BY EntityType";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            await using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                list.Add(new DropdownItem
                {
                    Id = rdr.GetInt32(0),
                    Name = rdr.IsDBNull(1) ? string.Empty : rdr.GetString(1)
                });
            }
            return list;
        }
        public async Task<List<FontSheet>> GetFontSheetsAsync()
        {
            var list = new List<FontSheet>();
            const string sql = @"
                SELECT Id, CompanyId, CRNNo, EntityName, Address, Phone, Email, CINNumber,
                       EntityType, DateOfIncorporation, EntityPan, NatureOfBusiness,
                       DOB, Gender, MaritalStatus, FatherMotherSpouseName,
                       Area, Ward, Zone, ProductServiceSold,
                       ElectricBillNo, PropertyTaxNo, SqFt, OtherDetails,
                       ClientSource, SourcedByEmpId,
                       DocPAN, DocAadhar, DocEntity, DocAddress, DocBank, DocPhoto, DocShop, DocMDA,
                       CrossSell, CrossSellDetails,
                       Comments, Login, Password, InternalDetails,
                       ScannedByName, ScannedBySign,
                       CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive
                FROM FrontSheet
                WHERE IsActive = 1
                ORDER BY EntityName";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            await using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                list.Add(new FontSheet
                {
                    Id = rdr.GetInt32(0),
                    CompanyId = rdr.IsDBNull(1) ? null : (int?)rdr.GetInt32(1),
                    CRNNo = rdr.IsDBNull(2) ? null : rdr.GetString(2),
                    EntityName = rdr.IsDBNull(3) ? string.Empty : rdr.GetString(3),
                    Address = rdr.IsDBNull(4) ? string.Empty : rdr.GetString(4),
                    Phone = rdr.IsDBNull(5) ? null : rdr.GetString(5),
                    Email = rdr.IsDBNull(6) ? null : rdr.GetString(6),
                    CINNumber = rdr.IsDBNull(7) ? null : rdr.GetString(7),
                    EntityType = rdr.IsDBNull(8) ? null : rdr.GetString(8),
                    DateOfIncorporation = rdr.IsDBNull(9) ? null : (DateTime?)rdr.GetDateTime(9),
                    EntityPan = rdr.IsDBNull(10) ? null : rdr.GetString(10),
                    NatureOfBusiness = rdr.IsDBNull(11) ? null : rdr.GetString(11),
                    DOB = rdr.IsDBNull(12) ? null : (DateTime?)rdr.GetDateTime(12),
                    Gender = rdr.IsDBNull(13) ? null : rdr.GetString(13),
                    MaritalStatus = rdr.IsDBNull(14) ? null : rdr.GetString(14),
                    FatherMotherSpouseName = rdr.IsDBNull(15) ? null : rdr.GetString(15),
                    Area = rdr.IsDBNull(16) ? null : rdr.GetString(16),
                    Ward = rdr.IsDBNull(17) ? null : rdr.GetString(17),
                    Zone = rdr.IsDBNull(18) ? null : rdr.GetString(18),
                    ProductServiceSold = rdr.IsDBNull(19) ? null : rdr.GetString(19),
                    ElectricBillNo = rdr.IsDBNull(20) ? null : rdr.GetString(20),
                    PropertyTaxNo = rdr.IsDBNull(21) ? null : rdr.GetString(21),
                    SqFt = rdr.IsDBNull(22) ? null : rdr.GetString(22),
                    OtherDetails = rdr.IsDBNull(23) ? null : rdr.GetString(23),
                    ClientSource = rdr.IsDBNull(24) ? null : rdr.GetString(24),
                    SourcedByEmpId = rdr.IsDBNull(25) ? null : (int?)rdr.GetInt32(25),
                    DocPAN = !rdr.IsDBNull(26) && rdr.GetBoolean(26),
                    DocAadhar = !rdr.IsDBNull(27) && rdr.GetBoolean(27),
                    DocEntity = !rdr.IsDBNull(28) && rdr.GetBoolean(28),
                    DocAddress = !rdr.IsDBNull(29) && rdr.GetBoolean(29),
                    DocBank = !rdr.IsDBNull(30) && rdr.GetBoolean(30),
                    DocPhoto = !rdr.IsDBNull(31) && rdr.GetBoolean(31),
                    DocShop = !rdr.IsDBNull(32) && rdr.GetBoolean(32),
                    DocMDA = !rdr.IsDBNull(33) && rdr.GetBoolean(33),
                    CrossSell = rdr.IsDBNull(34) ? null : rdr.GetString(34),
                    CrossSellDetails = rdr.IsDBNull(35) ? null : rdr.GetString(35),
                    Comments = rdr.IsDBNull(36) ? null : rdr.GetString(36),
                    Login = rdr.IsDBNull(37) ? null : rdr.GetString(37),
                    Password = rdr.IsDBNull(38) ? null : rdr.GetString(38),
                    InternalDetails = rdr.IsDBNull(39) ? null : rdr.GetString(39),
                    ScannedByName = rdr.IsDBNull(40) ? null : rdr.GetString(40),
                    ScannedBySign = rdr.IsDBNull(41) ? null : rdr.GetString(41),
                    CreatedDate = rdr.IsDBNull(42) ? null : (DateTime?)rdr.GetDateTime(42),
                    CreatedBy = rdr.IsDBNull(43) ? null : (int?)rdr.GetInt32(43),
                    ModifiedDate = rdr.IsDBNull(44) ? null : (DateTime?)rdr.GetDateTime(44),
                    ModifiedBy = rdr.IsDBNull(45) ? null : (int?)rdr.GetInt32(45),
                    IsActive = !rdr.IsDBNull(46) && rdr.GetBoolean(46)
                });
            }
            return list;
        }

        public async Task<int> CreateFontSheetAsync(FontSheet f)
        {
            const string sql = @"
                INSERT INTO FrontSheet
                (
                    CompanyId, CRNNo, EntityName, Address, Phone, Email, CINNumber,
                    EntityType, DateOfIncorporation, EntityPan, NatureOfBusiness,
                    DOB, Gender, MaritalStatus, FatherMotherSpouseName,
                    Area, Ward, Zone, ProductServiceSold,
                    ElectricBillNo, PropertyTaxNo, SqFt, OtherDetails,
                    ClientSource, SourcedByEmpId,
                    DocPAN, DocAadhar, DocEntity, DocAddress, DocBank, DocPhoto, DocShop, DocMDA,
                    CrossSell, CrossSellDetails,
                    Comments, Login, Password, InternalDetails,
                    ScannedByName, ScannedBySign,
                    CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive
                )
                OUTPUT INSERTED.Id
                VALUES
                (
                    @CompanyId, @CRNNo, @EntityName, @Address, @Phone, @Email, @CINNumber,
                    @EntityType, @DateOfIncorporation, @EntityPan, @NatureOfBusiness,
                    @DOB, @Gender, @MaritalStatus, @FatherMotherSpouseName,
                    @Area, @Ward, @Zone, @ProductServiceSold,
                    @ElectricBillNo, @PropertyTaxNo, @SqFt, @OtherDetails,
                    @ClientSource, @SourcedByEmpId,
                    @DocPAN, @DocAadhar, @DocEntity, @DocAddress, @DocBank, @DocPhoto, @DocShop, @DocMDA,
                    @CrossSell, @CrossSellDetails,
                    @Comments, @Login, @Password, @InternalDetails,
                    @ScannedByName, @ScannedBySign,
                    @CreatedDate, @CreatedBy, @ModifiedDate, @ModifiedBy, @IsActive
                )";

            await using var con = Conn();
            await con.OpenAsync();
            using var tx = con.BeginTransaction();
            try
            {
                await using var cmd = new SqlCommand(sql, con, tx);
                cmd.Parameters.AddWithValue("@CompanyId", f.CompanyId ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@CRNNo", f.CRNNo ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@EntityName", f.EntityName ?? string.Empty);
                cmd.Parameters.AddWithValue("@Address", f.Address ?? string.Empty);
                cmd.Parameters.AddWithValue("@Phone", f.Phone ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Email", f.Email ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@CINNumber", f.CINNumber ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@EntityType", f.EntityType ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@DateOfIncorporation", f.DateOfIncorporation ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@EntityPan", f.EntityPan ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@NatureOfBusiness", f.NatureOfBusiness ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@DOB", f.DOB ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Gender", f.Gender ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@MaritalStatus", f.MaritalStatus ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@FatherMotherSpouseName", f.FatherMotherSpouseName ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Area", f.Area ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Ward", f.Ward ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Zone", f.Zone ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ProductServiceSold", f.ProductServiceSold ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ElectricBillNo", f.ElectricBillNo ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@PropertyTaxNo", f.PropertyTaxNo ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@SqFt", f.SqFt ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@OtherDetails", f.OtherDetails ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ClientSource", f.ClientSource ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@SourcedByEmpId", f.SourcedByEmpId ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@DocPAN", f.DocPAN);
                cmd.Parameters.AddWithValue("@DocAadhar", f.DocAadhar);
                cmd.Parameters.AddWithValue("@DocEntity", f.DocEntity);
                cmd.Parameters.AddWithValue("@DocAddress", f.DocAddress);
                cmd.Parameters.AddWithValue("@DocBank", f.DocBank);
                cmd.Parameters.AddWithValue("@DocPhoto", f.DocPhoto);
                cmd.Parameters.AddWithValue("@DocShop", f.DocShop);
                cmd.Parameters.AddWithValue("@DocMDA", f.DocMDA);
                cmd.Parameters.AddWithValue("@CrossSell", f.CrossSell ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@CrossSellDetails", f.CrossSellDetails ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Comments", f.Comments ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Login", f.Login ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Password", f.Password ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@InternalDetails", f.InternalDetails ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ScannedByName", f.ScannedByName ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ScannedBySign", f.ScannedBySign ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@CreatedDate", f.CreatedDate ?? DateTime.UtcNow);
                cmd.Parameters.AddWithValue("@CreatedBy", f.CreatedBy ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ModifiedDate", f.ModifiedDate ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ModifiedBy", f.ModifiedBy ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@IsActive", f.IsActive);

                var idObj = await cmd.ExecuteScalarAsync();
                var id = idObj == null ? 0 : Convert.ToInt32(idObj);

                // Insert persons if any
                if (id > 0 && f.Persons != null && f.Persons.Count > 0)
                {
                    const string psql = @"INSERT INTO FrontSheetPerson (FrontSheetId, Name, Address, PAN, Aadhar, DisplayOrder, CreatedDate, IsActive)
                                          VALUES (@FrontSheetId, @Name, @Address, @PAN, @Aadhar, @DisplayOrder, GETDATE(), 1)";
                    foreach (var p in f.Persons)
                    {
                        await using var pcmd = new SqlCommand(psql, con, tx);
                        pcmd.Parameters.AddWithValue("@FrontSheetId", id);
                        pcmd.Parameters.AddWithValue("@Name", p.Name ?? (object)DBNull.Value);
                        pcmd.Parameters.AddWithValue("@Address", p.Address ?? (object)DBNull.Value);
                        pcmd.Parameters.AddWithValue("@PAN", p.PAN ?? (object)DBNull.Value);
                        pcmd.Parameters.AddWithValue("@Aadhar", p.Aadhar ?? (object)DBNull.Value);
                        pcmd.Parameters.AddWithValue("@DisplayOrder", p.DisplayOrder ?? (object)DBNull.Value);
                        await pcmd.ExecuteNonQueryAsync();
                    }
                }

                tx.Commit();
                return id;
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

        public async Task<bool> UpdateFontSheetAsync(FontSheet f)
        {
            const string sql = @"
                UPDATE FrontSheet SET
                    CompanyId=@CompanyId, CRNNo=@CRNNo, EntityName=@EntityName, Address=@Address, Phone=@Phone, Email=@Email, CINNumber=@CINNumber,
                    EntityType=@EntityType, DateOfIncorporation=@DateOfIncorporation, EntityPan=@EntityPan, NatureOfBusiness=@NatureOfBusiness,
                    DOB=@DOB, Gender=@Gender, MaritalStatus=@MaritalStatus, FatherMotherSpouseName=@FatherMotherSpouseName,
                    Area=@Area, Ward=@Ward, Zone=@Zone, ProductServiceSold=@ProductServiceSold,
                    ElectricBillNo=@ElectricBillNo, PropertyTaxNo=@PropertyTaxNo, SqFt=@SqFt, OtherDetails=@OtherDetails,
                    ClientSource=@ClientSource, SourcedByEmpId=@SourcedByEmpId,
                    DocPAN=@DocPAN, DocAadhar=@DocAadhar, DocEntity=@DocEntity, DocAddress=@DocAddress, DocBank=@DocBank, DocPhoto=@DocPhoto, DocShop=@DocShop, DocMDA=@DocMDA,
                    CrossSell=@CrossSell, CrossSellDetails=@CrossSellDetails,
                    Comments=@Comments, Login=@Login, Password=@Password, InternalDetails=@InternalDetails,
                    ScannedByName=@ScannedByName, ScannedBySign=@ScannedBySign,
                    ModifiedDate=@ModifiedDate, ModifiedBy=@ModifiedBy, IsActive=@IsActive
                WHERE Id=@Id";

            await using var con = Conn();
            await con.OpenAsync();
            using var tx = con.BeginTransaction();
            try
            {
                await using var cmd = new SqlCommand(sql, con, tx);
                cmd.Parameters.AddWithValue("@CompanyId", f.CompanyId ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@CRNNo", f.CRNNo ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@EntityName", f.EntityName ?? string.Empty);
                cmd.Parameters.AddWithValue("@Address", f.Address ?? string.Empty);
                cmd.Parameters.AddWithValue("@Phone", f.Phone ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Email", f.Email ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@CINNumber", f.CINNumber ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@EntityType", f.EntityType ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@DateOfIncorporation", f.DateOfIncorporation ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@EntityPan", f.EntityPan ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@NatureOfBusiness", f.NatureOfBusiness ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@DOB", f.DOB ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Gender", f.Gender ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@MaritalStatus", f.MaritalStatus ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@FatherMotherSpouseName", f.FatherMotherSpouseName ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Area", f.Area ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Ward", f.Ward ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Zone", f.Zone ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ProductServiceSold", f.ProductServiceSold ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ElectricBillNo", f.ElectricBillNo ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@PropertyTaxNo", f.PropertyTaxNo ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@SqFt", f.SqFt ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@OtherDetails", f.OtherDetails ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ClientSource", f.ClientSource ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@SourcedByEmpId", f.SourcedByEmpId ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@DocPAN", f.DocPAN);
                cmd.Parameters.AddWithValue("@DocAadhar", f.DocAadhar);
                cmd.Parameters.AddWithValue("@DocEntity", f.DocEntity);
                cmd.Parameters.AddWithValue("@DocAddress", f.DocAddress);
                cmd.Parameters.AddWithValue("@DocBank", f.DocBank);
                cmd.Parameters.AddWithValue("@DocPhoto", f.DocPhoto);
                cmd.Parameters.AddWithValue("@DocShop", f.DocShop);
                cmd.Parameters.AddWithValue("@DocMDA", f.DocMDA);
                cmd.Parameters.AddWithValue("@CrossSell", f.CrossSell ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@CrossSellDetails", f.CrossSellDetails ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Comments", f.Comments ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Login", f.Login ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Password", f.Password ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@InternalDetails", f.InternalDetails ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ScannedByName", f.ScannedByName ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ScannedBySign", f.ScannedBySign ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ModifiedDate", f.ModifiedDate ?? DateTime.UtcNow);
                cmd.Parameters.AddWithValue("@ModifiedBy", f.ModifiedBy ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@IsActive", f.IsActive);
                cmd.Parameters.AddWithValue("@Id", f.Id);

                var rows = await cmd.ExecuteNonQueryAsync();

                if (rows <= 0)
                {
                    tx.Rollback();
                    return false;
                }

                // Remove existing persons and re-insert supplied persons
                const string delSql = "DELETE FROM FrontSheetPerson WHERE FrontSheetId = @FrontSheetId";
                await using (var dcmd = new SqlCommand(delSql, con, tx))
                {
                    dcmd.Parameters.AddWithValue("@FrontSheetId", f.Id);
                    await dcmd.ExecuteNonQueryAsync();
                }

                if (f.Persons != null && f.Persons.Count > 0)
                {
                    const string psql = @"INSERT INTO FrontSheetPerson (FrontSheetId, Name, Address, PAN, Aadhar, DisplayOrder, CreatedDate, IsActive)
                                          VALUES (@FrontSheetId, @Name, @Address, @PAN, @Aadhar, @DisplayOrder, GETDATE(), 1)";
                    foreach (var p in f.Persons)
                    {
                        await using var pcmd = new SqlCommand(psql, con, tx);
                        pcmd.Parameters.AddWithValue("@FrontSheetId", f.Id);
                        pcmd.Parameters.AddWithValue("@Name", p.Name ?? (object)DBNull.Value);
                        pcmd.Parameters.AddWithValue("@Address", p.Address ?? (object)DBNull.Value);
                        pcmd.Parameters.AddWithValue("@PAN", p.PAN ?? (object)DBNull.Value);
                        pcmd.Parameters.AddWithValue("@Aadhar", p.Aadhar ?? (object)DBNull.Value);
                        pcmd.Parameters.AddWithValue("@DisplayOrder", p.DisplayOrder ?? (object)DBNull.Value);
                        await pcmd.ExecuteNonQueryAsync();
                    }
                }

                tx.Commit();
                return true;
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

        public async Task<FontSheet?> GetFontSheetByIdAsync(int id)
        {
            const string sql = @"
        SELECT Id, CompanyId, CRNNo, EntityName, Address, Phone, Email, CINNumber,
               EntityType, DateOfIncorporation, EntityPan, NatureOfBusiness,
               DOB, Gender, MaritalStatus, FatherMotherSpouseName,
               Area, Ward, Zone, ProductServiceSold,
               ElectricBillNo, PropertyTaxNo, SqFt, OtherDetails,
               ClientSource, SourcedByEmpId,
               DocPAN, DocAadhar, DocEntity, DocAddress, DocBank, DocPhoto, DocShop, DocMDA,
               CrossSell, CrossSellDetails,
               Comments, Login, Password, InternalDetails,
               ScannedByName, ScannedBySign,
               CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive
        FROM FrontSheet
        WHERE Id = @Id";

            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Id", id);

            await using var rdr = await cmd.ExecuteReaderAsync();
            if (!await rdr.ReadAsync()) return null;

            var fs = new FontSheet
            {
                Id = rdr.GetInt32(0),
                CompanyId = rdr.IsDBNull(1) ? null : (int?)rdr.GetInt32(1),
                CRNNo = rdr.IsDBNull(2) ? null : rdr.GetString(2),
                EntityName = rdr.IsDBNull(3) ? string.Empty : rdr.GetString(3),
                Address = rdr.IsDBNull(4) ? string.Empty : rdr.GetString(4),
                Phone = rdr.IsDBNull(5) ? null : rdr.GetString(5),
                Email = rdr.IsDBNull(6) ? null : rdr.GetString(6),
                CINNumber = rdr.IsDBNull(7) ? null : rdr.GetString(7),
                EntityType = rdr.IsDBNull(8) ? null : rdr.GetString(8),
                DateOfIncorporation = rdr.IsDBNull(9) ? null : (DateTime?)rdr.GetDateTime(9),
                EntityPan = rdr.IsDBNull(10) ? null : rdr.GetString(10),
                NatureOfBusiness = rdr.IsDBNull(11) ? null : rdr.GetString(11),
                DOB = rdr.IsDBNull(12) ? null : (DateTime?)rdr.GetDateTime(12),
                Gender = rdr.IsDBNull(13) ? null : rdr.GetString(13),
                MaritalStatus = rdr.IsDBNull(14) ? null : rdr.GetString(14),
                FatherMotherSpouseName = rdr.IsDBNull(15) ? null : rdr.GetString(15),
                Area = rdr.IsDBNull(16) ? null : rdr.GetString(16),
                Ward = rdr.IsDBNull(17) ? null : rdr.GetString(17),
                Zone = rdr.IsDBNull(18) ? null : rdr.GetString(18),
                ProductServiceSold = rdr.IsDBNull(19) ? null : rdr.GetString(19),
                ElectricBillNo = rdr.IsDBNull(20) ? null : rdr.GetString(20),
                PropertyTaxNo = rdr.IsDBNull(21) ? null : rdr.GetString(21),
                SqFt = rdr.IsDBNull(22) ? null : rdr.GetString(22),
                OtherDetails = rdr.IsDBNull(23) ? null : rdr.GetString(23),
                ClientSource = rdr.IsDBNull(24) ? null : rdr.GetString(24),
                SourcedByEmpId = rdr.IsDBNull(25) ? null : (int?)rdr.GetInt32(25),
                DocPAN = !rdr.IsDBNull(26) && rdr.GetBoolean(26),
                DocAadhar = !rdr.IsDBNull(27) && rdr.GetBoolean(27),
                DocEntity = !rdr.IsDBNull(28) && rdr.GetBoolean(28),
                DocAddress = !rdr.IsDBNull(29) && rdr.GetBoolean(29),
                DocBank = !rdr.IsDBNull(30) && rdr.GetBoolean(30),
                DocPhoto = !rdr.IsDBNull(31) && rdr.GetBoolean(31),
                DocShop = !rdr.IsDBNull(32) && rdr.GetBoolean(32),
                DocMDA = !rdr.IsDBNull(33) && rdr.GetBoolean(33),
                CrossSell = rdr.IsDBNull(34) ? null : rdr.GetString(34),
                CrossSellDetails = rdr.IsDBNull(35) ? null : rdr.GetString(35),
                Comments = rdr.IsDBNull(36) ? null : rdr.GetString(36),
                Login = rdr.IsDBNull(37) ? null : rdr.GetString(37),
                Password = rdr.IsDBNull(38) ? null : rdr.GetString(38),
                InternalDetails = rdr.IsDBNull(39) ? null : rdr.GetString(39),
                ScannedByName = rdr.IsDBNull(40) ? null : rdr.GetString(40),
                ScannedBySign = rdr.IsDBNull(41) ? null : rdr.GetString(41),
                CreatedDate = rdr.IsDBNull(42) ? null : (DateTime?)rdr.GetDateTime(42),
                CreatedBy = rdr.IsDBNull(43) ? null : (int?)rdr.GetInt32(43),
                ModifiedDate = rdr.IsDBNull(44) ? null : (DateTime?)rdr.GetDateTime(44),
                ModifiedBy = rdr.IsDBNull(45) ? null : (int?)rdr.GetInt32(45),
                IsActive = !rdr.IsDBNull(46) && rdr.GetBoolean(46)
            };

            await rdr.DisposeAsync();

            const string psql = @"SELECT Id, FrontSheetId, Name, Address, PAN, Aadhar, DisplayOrder, CreatedDate, IsActive
                          FROM FrontSheetPerson WHERE FrontSheetId = @FrontSheetId AND IsActive = 1 ORDER BY DisplayOrder";
            await using var pcmd = new SqlCommand(psql, con);
            pcmd.Parameters.AddWithValue("@FrontSheetId", id);
            await using var prdr = await pcmd.ExecuteReaderAsync();

            var persons = new List<FrontSheetPerson>();
            while (await prdr.ReadAsync())
            {
                persons.Add(new FrontSheetPerson
                {
                    Id = prdr.GetInt32(0),
                    FrontSheetId = prdr.GetInt32(1),
                    Name = prdr.IsDBNull(2) ? null : prdr.GetString(2),
                    Address = prdr.IsDBNull(3) ? null : prdr.GetString(3),
                    PAN = prdr.IsDBNull(4) ? null : prdr.GetString(4),
                    Aadhar = prdr.IsDBNull(5) ? null : prdr.GetString(5),
                    DisplayOrder = prdr.IsDBNull(6) ? null : (int?)prdr.GetInt32(6),
                    CreatedDate = prdr.IsDBNull(7) ? null : (DateTime?)prdr.GetDateTime(7),
                    IsActive = !prdr.IsDBNull(8) && prdr.GetBoolean(8)
                });
            }

            fs.Persons = persons;
            return fs;
        }

        public async Task<bool> DeleteFontSheetAsync(int id)
        {
            const string sql = @"UPDATE FrontSheet SET IsActive = 0, ModifiedDate = GETDATE() WHERE Id = @Id;";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@Id", id);

            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }
        #endregion

        #region ShopCategoryLinks
        public async Task<List<ShopCategoryLink>> GetShopLinksAsync()
        {
            var list = new List<ShopCategoryLink>();
            const string sql = @"SELECT Id, StateName, Url, IsActive, CreatedDate, CreatedBy FROM ShopCategoryLinks ORDER BY StateName";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            await using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                list.Add(new ShopCategoryLink
                {
                    Id = rdr.GetInt32(0),
                    StateName = rdr.GetString(1),
                    Url = rdr.IsDBNull(2) ? null : rdr.GetString(2),
                    IsActive = !rdr.IsDBNull(3) && rdr.GetBoolean(3),
                    CreatedDate = rdr.IsDBNull(4) ? null : (DateTime?)rdr.GetDateTime(4),
                    CreatedBy = rdr.IsDBNull(5) ? null : (int?)rdr.GetInt32(5)
                });
            }
            return list;
        }

        public async Task<int> CreateShopLinkAsync(ShopCategoryLink s)
        {
            const string sql = @"INSERT INTO ShopCategoryLinks (StateName, Url, IsActive, CreatedDate, CreatedBy)
                                 OUTPUT INSERTED.Id
                                 VALUES(@StateName,@Url,@IsActive,@CreatedDate,@CreatedBy)";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@StateName", s.StateName ?? string.Empty);
            cmd.Parameters.AddWithValue("@Url", s.Url ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", s.IsActive);
            cmd.Parameters.AddWithValue("@CreatedDate", s.CreatedDate ?? DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@CreatedBy", s.CreatedBy ?? (object)DBNull.Value);
            var id = await cmd.ExecuteScalarAsync();
            return id == null ? 0 : Convert.ToInt32(id);
        }

        public async Task<bool> UpdateShopLinkAsync(ShopCategoryLink s)
        {
            const string sql = @"UPDATE ShopCategoryLinks SET StateName=@StateName, Url=@Url, IsActive=@IsActive, CreatedDate=@CreatedDate, CreatedBy=@CreatedBy WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@StateName", s.StateName ?? string.Empty);
            cmd.Parameters.AddWithValue("@Url", s.Url ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", s.IsActive);
            cmd.Parameters.AddWithValue("@CreatedDate", s.CreatedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@CreatedBy", s.CreatedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Id", s.Id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }
        #endregion

        #region TradeCategoryLinks
        public async Task<List<TradeCategoryLink>> GetTradeLinksAsync()
        {
            var list = new List<TradeCategoryLink>();
            const string sql = @"SELECT Id, CorporationName, Website, IsActive, CreatedDate, CreatedBy FROM TradeCategoryLinks ORDER BY CorporationName";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            await using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                list.Add(new TradeCategoryLink
                {
                    Id = rdr.GetInt32(0),
                    CorporationName = rdr.GetString(1),
                    Website = rdr.IsDBNull(2) ? null : rdr.GetString(2),
                    IsActive = !rdr.IsDBNull(3) && rdr.GetBoolean(3),
                    CreatedDate = rdr.IsDBNull(4) ? null : (DateTime?)rdr.GetDateTime(4),
                    CreatedBy = rdr.IsDBNull(5) ? null : (int?)rdr.GetInt32(5)
                });
            }
            return list;
        }

        public async Task<int> CreateTradeLinkAsync(TradeCategoryLink t)
        {
            const string sql = @"INSERT INTO TradeCategoryLinks (CorporationName, Website, IsActive, CreatedDate, CreatedBy)
                                 OUTPUT INSERTED.Id
                                 VALUES(@CorporationName,@Website,@IsActive,@CreatedDate,@CreatedBy)";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@CorporationName", t.CorporationName ?? string.Empty);
            cmd.Parameters.AddWithValue("@Website", t.Website ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", t.IsActive);
            cmd.Parameters.AddWithValue("@CreatedDate", t.CreatedDate ?? DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@CreatedBy", t.CreatedBy ?? (object)DBNull.Value);
            var id = await cmd.ExecuteScalarAsync();
            return id == null ? 0 : Convert.ToInt32(id);
        }

        public async Task<bool> UpdateTradeLinkAsync(TradeCategoryLink t)
        {
            const string sql = @"UPDATE TradeCategoryLinks SET CorporationName=@CorporationName, Website=@Website, IsActive=@IsActive, CreatedDate=@CreatedDate, CreatedBy=@CreatedBy WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@CorporationName", t.CorporationName ?? string.Empty);
            cmd.Parameters.AddWithValue("@Website", t.Website ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", t.IsActive);
            cmd.Parameters.AddWithValue("@CreatedDate", t.CreatedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@CreatedBy", t.CreatedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Id", t.Id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }
        #endregion

        #region Invoice

        public async Task<List<InvoiceModel>> GetInvoiceByFilterAsync(InvoiceFilterRequest? filter)
        {
            filter ??= new Investica.Models.InvoiceFilterRequest();

            var list = new List<InvoiceModel>();
            var sb = new System.Text.StringBuilder();
            sb.Append(@"
SELECT
    Id,
    InvoiceNumber,
    InvoiceTo,
    GstNoTo,
    InvoiceFrom,
    GstNoFrom,
    Particulars,
    GrossAmoutRs,
    NetAmoutRsm,
    SubTotal,
    IGST,
    NetTotal,
    CreatedDate,
    CreatedBy,
    ModifiedDate,
    ModifiedBy,
    IsActive
FROM Invoice
WHERE 1=1
");

            var parameters = new List<SqlParameter>();
            if (!string.IsNullOrEmpty(filter.InvoiceNumber))
            {
                sb.Append(" AND InvoiceNumber = @InvoiceNumber");
                parameters.Add(new SqlParameter("@InvoiceNumber", filter.InvoiceNumber));
            }

            if (filter.StartDate.HasValue)
            {
                sb.Append(" AND CreatedDate >= @StartDate");
                parameters.Add(new SqlParameter("@StartDate", filter.StartDate.Value));
            }

            sb.Append(" ORDER BY CreatedDate DESC");

            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sb.ToString(), con);

            if (parameters.Count > 0)
                cmd.Parameters.AddRange(parameters.ToArray());

            await using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                list.Add(new InvoiceModel
                {
                    Id = rdr.GetInt32(0),
                    InvoiceNumber = rdr.IsDBNull(1) ? string.Empty : rdr.GetString(1),
                    InvoiceTo = rdr.IsDBNull(2) ? null : rdr.GetString(2),
                    GstNoTo = rdr.IsDBNull(3) ? string.Empty : rdr.GetString(3),
                    InvoiceFrom = rdr.IsDBNull(4) ? null : rdr.GetString(4),
                    GstNoFrom = rdr.IsDBNull(5) ? string.Empty : rdr.GetString(5),
                    Particulars = rdr.IsDBNull(6) ? null : rdr.GetString(6),
                    GrossAmoutRs = rdr.IsDBNull(7) ? string.Empty : rdr.GetString(7),
                    NetAmoutRsm = rdr.IsDBNull(8) ? string.Empty : rdr.GetString(8),
                    SubTotal = rdr.IsDBNull(9) ? string.Empty : rdr.GetString(9),
                    IGST = rdr.IsDBNull(10) ? 0 : rdr.GetInt32(10),
                    NetTotal = rdr.IsDBNull(11) ? string.Empty : rdr.GetString(11),
                    CreatedDate = rdr.IsDBNull(12) ? null : rdr.GetDateTime(12),
                    CreatedBy = rdr.IsDBNull(13) ? null : rdr.GetInt32(13),
                    ModifiedDate = rdr.IsDBNull(14) ? null : rdr.GetDateTime(14),
                    ModifiedBy = rdr.IsDBNull(15) ? null : rdr.GetInt32(15),
                    IsActive = rdr.IsDBNull(16) ? true : rdr.GetBoolean(16)
                });
            }

            return list;
        }
        public async Task<List<InvoiceModel>> GetInvoicesAsync()
        {
            var list = new List<InvoiceModel>();
            const string sql = @"SELECT Id, InvoiceNumber, InvoiceTo, GstNoTo, InvoiceFrom, GstNoFrom, Particulars, GrossAmoutRs, NetAmoutRsm, SubTotal, IGST, NetTotal, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive FROM Invoice ORDER BY CreatedDate DESC";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            await using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                list.Add(new InvoiceModel
                {
                    Id = rdr.GetInt32(0),
                    InvoiceNumber = rdr.IsDBNull(1) ? null : rdr.GetString(1),
                    InvoiceTo = rdr.IsDBNull(2) ? null : rdr.GetString(2),
                    GstNoTo = rdr.IsDBNull(3) ? null : rdr.GetString(3),
                    InvoiceFrom = rdr.IsDBNull(4) ? null : rdr.GetString(4),
                    GstNoFrom = rdr.IsDBNull(5) ? null : rdr.GetString(5),
                    Particulars = rdr.IsDBNull(6) ? null : rdr.GetString(6),
                    GrossAmoutRs = rdr.IsDBNull(7) ? null : rdr.GetString(7),
                    NetAmoutRsm = rdr.IsDBNull(8) ? null : rdr.GetString(8),
                    SubTotal = rdr.IsDBNull(9) ? null : rdr.GetString(9),
                    IGST = rdr.IsDBNull(10) ? 0 : rdr.GetInt32(10),
                    NetTotal = rdr.IsDBNull(11) ? null : rdr.GetString(11),
                    CreatedDate = rdr.IsDBNull(12) ? null : (DateTime?)rdr.GetDateTime(12),
                    CreatedBy = rdr.IsDBNull(13) ? null : (int?)rdr.GetInt32(13),
                    ModifiedDate = rdr.IsDBNull(14) ? null : (DateTime?)rdr.GetDateTime(14),
                    ModifiedBy = rdr.IsDBNull(15) ? null : (int?)rdr.GetInt32(15),
                    IsActive = !rdr.IsDBNull(16) && rdr.GetBoolean(16)
                });
            }
            return list;
        }

        public async Task<int> CreateInvoiceAsync(InvoiceModel inv)
        {
            const string sql = @"INSERT INTO Invoice (InvoiceNumber, InvoiceTo, GstNoTo, InvoiceFrom, GstNoFrom, Particulars, GrossAmoutRs, NetAmoutRsm, SubTotal, IGST, NetTotal, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive)
                                 OUTPUT INSERTED.Id
                                 VALUES(@InvoiceNumber,@InvoiceTo,@GstNoTo,@InvoiceFrom,@GstNoFrom,@Particulars,@GrossAmoutRs,@NetAmoutRsm,@SubTotal,@IGST,@NetTotal,@CreatedDate,@CreatedBy,@ModifiedDate,@ModifiedBy,@IsActive)";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@InvoiceNumber", inv.InvoiceNumber ?? string.Empty);
            cmd.Parameters.AddWithValue("@InvoiceTo", inv.InvoiceTo ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@GstNoTo", inv.GstNoTo ?? string.Empty);
            cmd.Parameters.AddWithValue("@InvoiceFrom", inv.InvoiceFrom ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@GstNoFrom", inv.GstNoFrom ?? string.Empty);
            cmd.Parameters.AddWithValue("@Particulars", inv.Particulars ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@GrossAmoutRs", inv.GrossAmoutRs ?? string.Empty);
            cmd.Parameters.AddWithValue("@NetAmoutRsm", inv.NetAmoutRsm ?? string.Empty);
            cmd.Parameters.AddWithValue("@SubTotal", inv.SubTotal ?? string.Empty);
            cmd.Parameters.AddWithValue("@IGST", inv.IGST);
            cmd.Parameters.AddWithValue("@NetTotal", inv.NetTotal ?? string.Empty);
            cmd.Parameters.AddWithValue("@CreatedDate", inv.CreatedDate ?? DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@CreatedBy", inv.CreatedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedDate", inv.ModifiedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedBy", inv.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", inv.IsActive);
            var id = await cmd.ExecuteScalarAsync();
            return id == null ? 0 : Convert.ToInt32(id);
        }

        public async Task<bool> UpdateInvoiceAsync(InvoiceModel inv )
        {
            const string sql = @"UPDATE Invoice SET InvoiceNumber=@InvoiceNumber, InvoiceTo=@InvoiceTo, GstNoTo=@GstNoTo,
InvoiceFrom=@InvoiceFrom, GstNoFrom=@GstNoFrom, Particulars=@Particulars, GrossAmoutRs=@GrossAmoutRs, 
NetAmoutRsm=@NetAmoutRsm, SubTotal=@SubTotal, IGST=@IGST, NetTotal=@NetTotal, ModifiedDate=@ModifiedDate, 
ModifiedBy=@ModifiedBy, IsActive=@IsActive WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@InvoiceNumber", inv.InvoiceNumber ?? string.Empty);
            cmd.Parameters.AddWithValue("@InvoiceTo", inv.InvoiceTo ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@GstNoTo", inv.GstNoTo ?? string.Empty);
            cmd.Parameters.AddWithValue("@InvoiceFrom", inv.InvoiceFrom ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@GstNoFrom", inv.GstNoFrom ?? string.Empty);
            cmd.Parameters.AddWithValue("@Particulars", inv.Particulars ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@GrossAmoutRs", inv.GrossAmoutRs ?? string.Empty);
            cmd.Parameters.AddWithValue("@NetAmoutRsm", inv.NetAmoutRsm ?? string.Empty);
            cmd.Parameters.AddWithValue("@SubTotal", inv.SubTotal ?? string.Empty);
            cmd.Parameters.AddWithValue("@IGST", inv.IGST);
            cmd.Parameters.AddWithValue("@NetTotal", inv.NetTotal ?? string.Empty);
            cmd.Parameters.AddWithValue("@ModifiedDate", inv.ModifiedDate ?? DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@ModifiedBy", inv.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", inv.IsActive);
            cmd.Parameters.AddWithValue("@Id", inv.Id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }

       
        #endregion
    }
}