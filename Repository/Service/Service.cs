using Investica.Models;
using Investica.Repository.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
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
            const string sql = @"SELECT Id, CompanyId, EmployeeId, LicenseId, StatusId, CompanyAddress, Description, TrackingNumber, ValidTill, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy FROM Tickets WHERE Id=@Id";
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
                OUTPUT INSERTED.Id
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
                var id = await cmd.ExecuteScalarAsync();
                return id == null ? 0 : Convert.ToInt32(id);
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
        #endregion

        #region UpcomingRenewals
        public async Task<List<UpcomingRenewal>> GetUpcomingRenewalsAsync()
        {
            var list = new List<UpcomingRenewal>();
            const string sql = @"SELECT Id, CompanyId, LicenseTypeId, Location, CurrentExpiryDate, RenewalDueDate, StatusId, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive FROM UpcomingRenewals ORDER BY RenewalDueDate";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            await using var rdr = await cmd.ExecuteReaderAsync();
            while (await rdr.ReadAsync())
            {
                list.Add(new UpcomingRenewal
                {
                    Id = rdr.GetInt32(0),
                    CompanyId = rdr.GetInt32(1),
                    LicenseTypeId = rdr.GetInt32(2),
                    Location = rdr.IsDBNull(3) ? null : rdr.GetString(3),
                    CurrentExpiryDate = rdr.IsDBNull(4) ? null : (DateTime?)rdr.GetDateTime(4),
                    RenewalDueDate = rdr.IsDBNull(5) ? null : (DateTime?)rdr.GetDateTime(5),
                    StatusId = rdr.GetInt32(6),
                    CreatedDate = rdr.IsDBNull(7) ? null : (DateTime?)rdr.GetDateTime(7),
                    CreatedBy = rdr.IsDBNull(8) ? null : (int?)rdr.GetInt32(8),
                    ModifiedDate = rdr.IsDBNull(9) ? null : rdr.GetDateTime(9),
                    ModifiedBy = rdr.IsDBNull(10) ? null : rdr.GetString(10),
                    IsActive = !rdr.IsDBNull(11) && rdr.GetBoolean(11)
                });
            }
            return list;
        }

        public async Task<int> CreateUpcomingRenewalAsync(UpcomingRenewal r)
        {
            const string sql = @"INSERT INTO UpcomingRenewals (CompanyId, LicenseTypeId, Location, CurrentExpiryDate, RenewalDueDate, StatusId, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive)
                                 OUTPUT INSERTED.Id
                                 VALUES(@CompanyId,@LicenseTypeId,@Location,@CurrentExpiryDate,@RenewalDueDate,@StatusId,@CreatedDate,@CreatedBy,@ModifiedDate,@ModifiedBy,@IsActive)";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@CompanyId", r.CompanyId);
            cmd.Parameters.AddWithValue("@LicenseTypeId", r.LicenseTypeId);
            cmd.Parameters.AddWithValue("@Location", (object?)r.Location ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@CurrentExpiryDate", r.CurrentExpiryDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@RenewalDueDate", r.RenewalDueDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@StatusId", r.StatusId);
            cmd.Parameters.AddWithValue("@CreatedDate", r.CreatedDate ?? DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@CreatedBy", r.CreatedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedDate", r.ModifiedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedBy", r.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", r.IsActive);
            var id = await cmd.ExecuteScalarAsync();
            return id == null ? 0 : Convert.ToInt32(id);
        }

        public async Task<bool> UpdateUpcomingRenewalAsync(UpcomingRenewal r)
        {
            const string sql = @"UPDATE UpcomingRenewals SET CompanyId=@CompanyId, LicenseTypeId=@LicenseTypeId, Location=@Location, CurrentExpiryDate=@CurrentExpiryDate, RenewalDueDate=@RenewalDueDate, StatusId=@StatusId, ModifiedDate=@ModifiedDate, ModifiedBy=@ModifiedBy, IsActive=@IsActive WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@CompanyId", r.CompanyId);
            cmd.Parameters.AddWithValue("@LicenseTypeId", r.LicenseTypeId);
            cmd.Parameters.AddWithValue("@Location", (object?)r.Location ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@CurrentExpiryDate", r.CurrentExpiryDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@RenewalDueDate", r.RenewalDueDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@StatusId", r.StatusId);
            cmd.Parameters.AddWithValue("@ModifiedDate", r.ModifiedDate ?? DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@ModifiedBy", r.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", r.IsActive);
            cmd.Parameters.AddWithValue("@Id", r.Id);
            var rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }
        #endregion

        #region FontSheet
        public async Task<List<FontSheet>> GetFontSheetsAsync()
        {
            var list = new List<FontSheet>();
            const string sql = @"SELECT Id, CompanyId, EntityName, Address, Phone, Email, PromoterNameAddress, EntityType, NatureOfBusiness, PanAadhar, EntityPan, DOB, Gender, MaritalStatus, FatherMotherSpouseName, Area, Ward, Zone, ProductServiceSold, ClientSource, SourcedByEmpId, Comments, Login, Password, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive FROM FontSheet ORDER BY EntityName";
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
                    EntityName = rdr.IsDBNull(2) ? string.Empty : rdr.GetString(2),
                    Address = rdr.IsDBNull(3) ? string.Empty : rdr.GetString(3),
                    Phone = rdr.IsDBNull(4) ? null : rdr.GetString(4),
                    Email = rdr.IsDBNull(5) ? null : rdr.GetString(5),
                    PromoterNameAddress = rdr.IsDBNull(6) ? null : rdr.GetString(6),
                    EntityType = rdr.IsDBNull(7) ? null : rdr.GetString(7),
                    NatureOfBusiness = rdr.IsDBNull(8) ? null : rdr.GetString(8),
                    PanAadhar = rdr.IsDBNull(9) ? null : rdr.GetString(9),
                    EntityPan = rdr.IsDBNull(10) ? null : rdr.GetString(10),
                    DOB = rdr.IsDBNull(11) ? null : (DateTime?)rdr.GetDateTime(11),
                    Gender = rdr.IsDBNull(12) ? null : rdr.GetString(12),
                    MaritalStatus = rdr.IsDBNull(13) ? null : rdr.GetString(13),
                    FatherMotherSpouseName = rdr.IsDBNull(14) ? null : rdr.GetString(14),
                    Area = rdr.IsDBNull(15) ? null : rdr.GetString(15),
                    Ward = rdr.IsDBNull(16) ? null : rdr.GetString(16),
                    Zone = rdr.IsDBNull(17) ? null : rdr.GetString(17),
                    ProductServiceSold = rdr.IsDBNull(18) ? null : rdr.GetString(18),
                    ClientSource = rdr.IsDBNull(19) ? null : rdr.GetString(19),
                    SourcedByEmpId = rdr.IsDBNull(20) ? null : (int?)rdr.GetInt32(20),
                    Comments = rdr.IsDBNull(21) ? null : rdr.GetString(21),
                    Login = rdr.IsDBNull(22) ? null : rdr.GetString(22),
                    Password = rdr.IsDBNull(23) ? null : rdr.GetString(23),
                    CreatedDate = rdr.IsDBNull(24) ? null : (DateTime?)rdr.GetDateTime(24),
                    CreatedBy = rdr.IsDBNull(25) ? null : (int?)rdr.GetInt32(25),
                    ModifiedDate = rdr.IsDBNull(26) ? null : (DateTime?)rdr.GetDateTime(26),
                    ModifiedBy = rdr.IsDBNull(27) ? null : (int?)rdr.GetInt32(27),
                    IsActive = !rdr.IsDBNull(28) && rdr.GetBoolean(28)
                });
            }
            return list;
        }

        public async Task<int> CreateFontSheetAsync(FontSheet f)
        {
            const string sql = @"INSERT INTO FontSheet (CompanyId, EntityName, Address, Phone, Email, PromoterNameAddress, EntityType, NatureOfBusiness, PanAadhar, EntityPan, DOB, Gender, MaritalStatus, FatherMotherSpouseName, Area, Ward, Zone, ProductServiceSold, ClientSource, SourcedByEmpId, Comments, Login, Password, CreatedDate, CreatedBy, ModifiedDate, ModifiedBy, IsActive)
                                 OUTPUT INSERTED.Id
                                 VALUES(@CompanyId,@EntityName,@Address,@Phone,@Email,@PromoterNameAddress,@EntityType,@NatureOfBusiness,@PanAadhar,@EntityPan,@DOB,@Gender,@MaritalStatus,@FatherMotherSpouseName,@Area,@Ward,@Zone,@ProductServiceSold,@ClientSource,@SourcedByEmpId,@Comments,@Login,@Password,@CreatedDate,@CreatedBy,@ModifiedDate,@ModifiedBy,@IsActive)";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);

            cmd.Parameters.AddWithValue("@CompanyId", f.CompanyId ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@EntityName", f.EntityName ?? string.Empty);
            cmd.Parameters.AddWithValue("@Address", f.Address ?? string.Empty);
            cmd.Parameters.AddWithValue("@Phone", f.Phone ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Email", f.Email ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@PromoterNameAddress", f.PromoterNameAddress ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@EntityType", f.EntityType ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@NatureOfBusiness", f.NatureOfBusiness ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@PanAadhar", f.PanAadhar ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@EntityPan", f.EntityPan ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@DOB", f.DOB ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Gender", f.Gender ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@MaritalStatus", f.MaritalStatus ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@FatherMotherSpouseName", f.FatherMotherSpouseName ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Area", f.Area ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Ward", f.Ward ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Zone", f.Zone ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ProductServiceSold", f.ProductServiceSold ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ClientSource", f.ClientSource ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@SourcedByEmpId", f.SourcedByEmpId ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Comments", f.Comments ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Login", f.Login ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Password", f.Password ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@CreatedDate", f.CreatedDate ?? DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@CreatedBy", f.CreatedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedDate", f.ModifiedDate ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedBy", f.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", f.IsActive);

            var id = await cmd.ExecuteScalarAsync();
            return id == null ? 0 : Convert.ToInt32(id);
        }

        public async Task<bool> UpdateFontSheetAsync(FontSheet f)
        {
            const string sql = @"UPDATE FontSheet SET CompanyId=@CompanyId, EntityName=@EntityName, Address=@Address, Phone=@Phone, Email=@Email, PromoterNameAddress=@PromoterNameAddress, EntityType=@EntityType, NatureOfBusiness=@NatureOfBusiness, PanAadhar=@PanAadhar, EntityPan=@EntityPan, DOB=@DOB, Gender=@Gender, MaritalStatus=@MaritalStatus, FatherMotherSpouseName=@FatherMotherSpouseName, Area=@Area, Ward=@Ward, Zone=@Zone, ProductServiceSold=@ProductServiceSold, ClientSource=@ClientSource, SourcedByEmpId=@SourcedByEmpId, Comments=@Comments, Login=@Login, Password=@Password, ModifiedDate=@ModifiedDate, ModifiedBy=@ModifiedBy, IsActive=@IsActive WHERE Id=@Id";
            await using var con = Conn();
            await con.OpenAsync();
            await using var cmd = new SqlCommand(sql, con);

            cmd.Parameters.AddWithValue("@CompanyId", f.CompanyId ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@EntityName", f.EntityName ?? string.Empty);
            cmd.Parameters.AddWithValue("@Address", f.Address ?? string.Empty);
            cmd.Parameters.AddWithValue("@Phone", f.Phone ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Email", f.Email ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@PromoterNameAddress", f.PromoterNameAddress ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@EntityType", f.EntityType ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@NatureOfBusiness", f.NatureOfBusiness ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@PanAadhar", f.PanAadhar ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@EntityPan", f.EntityPan ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@DOB", f.DOB ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Gender", f.Gender ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@MaritalStatus", f.MaritalStatus ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@FatherMotherSpouseName", f.FatherMotherSpouseName ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Area", f.Area ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Ward", f.Ward ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Zone", f.Zone ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ProductServiceSold", f.ProductServiceSold ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ClientSource", f.ClientSource ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@SourcedByEmpId", f.SourcedByEmpId ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Comments", f.Comments ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Login", f.Login ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Password", f.Password ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedDate", f.ModifiedDate ?? DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@ModifiedBy", f.ModifiedBy ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@IsActive", f.IsActive);
            cmd.Parameters.AddWithValue("@Id", f.Id);

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

        public async Task<bool> UpdateInvoiceAsync(InvoiceModel inv)
        {
            const string sql = @"UPDATE Invoice SET InvoiceNumber=@InvoiceNumber, InvoiceTo=@InvoiceTo, GstNoTo=@GstNoTo, InvoiceFrom=@InvoiceFrom, GstNoFrom=@GstNoFrom, Particulars=@Particulars, GrossAmoutRs=@GrossAmoutRs, NetAmoutRsm=@NetAmoutRsm, SubTotal=@SubTotal, IGST=@IGST, NetTotal=@NetTotal, ModifiedDate=@ModifiedDate, ModifiedBy=@ModifiedBy, IsActive=@IsActive WHERE Id=@Id";
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